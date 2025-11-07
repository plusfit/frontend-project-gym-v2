import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { Subject, takeUntil, debounceTime, Observable, finalize } from 'rxjs';
import { Store, Actions, ofActionSuccessful } from '@ngxs/store';

import { PaymentsState } from '../../state/payments.state';
import {
  GetPayments,
  SearchPaymentsByName,
  GetPaymentsSummary,
  UpdatePayment,
  DeletePayment,
  ExportPayments,
  SetPaymentsFilters,
  ClearPaymentsError
} from '../../state/payments.actions';

import { PaymentsTableComponent } from '../../components/payments-table/payments-table.component';
import { DeletePaymentDialogComponent } from '../../components/delete-payment-dialog/delete-payment-dialog.component';
import { EditPaymentDialogComponent } from '../../components/edit-payment-dialog/edit-payment-dialog.component';
import { PaymentsService } from '../../services/payments.service';
import { SnackBarService } from '@core/services/snackbar.service';
import {
  PaymentItem,
  PaymentsFilters,
  PaymentsStats,
  PaymentsSummary
} from '../../interfaces/payments.interface';

@Component({
  selector: 'app-payments-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    FormsModule,
    PaymentsTableComponent,
    MatPaginatorModule
  ],
  templateUrl: './payments-page.component.html',
  styleUrls: ['./payments-page.component.css']
  // changeDetection: ChangeDetectionStrategy.OnPush // Commenting out to test
})
export class PaymentsPageComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();

  // Component state using NGXS observables
  payments$: Observable<PaymentItem[]>;
  loading$: Observable<boolean>;
  totalCount$: Observable<number>;
  currentPage$: Observable<number>;
  pageSize$: Observable<number>;
  hasError$: Observable<boolean>;
  errorMessage$: Observable<string>;

  // Summary using NGXS observables
  summary$: Observable<PaymentsSummary | null>;
  summaryLoading$: Observable<boolean>;
  summaryError$: Observable<boolean>;

  // Filters
  filterForm: FormGroup;
  searchControl = new FormControl('');
  activeQuickFilter: string | null = null;
  
  // Direct date properties for ngModel
  startDate: Date | null = null;
  endDate: Date | null = null;
  
  currentFilters: PaymentsFilters = {
    page: 1,
    limit: 8
  };

  constructor(
    private store: Store,
    private actions: Actions,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Initialize dates directly
    const today = new Date();
    this.startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    this.endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.filterForm = this.fb.group({
      startDate: [this.startDate],
      endDate: [this.endDate]
    });

    // Initialize observables from NGXS store
    this.payments$ = this.store.select(PaymentsState.getPayments);
    this.loading$ = this.store.select(PaymentsState.isLoading);
    this.totalCount$ = this.store.select(PaymentsState.getTotal);
    this.currentPage$ = this.store.select(PaymentsState.getCurrentPage);
    this.pageSize$ = this.store.select(PaymentsState.getPageSize);
    this.hasError$ = this.store.select(PaymentsState.hasError);
    this.errorMessage$ = this.store.select(PaymentsState.getErrorMessage);
    this.summary$ = this.store.select(PaymentsState.getSummary);
    this.summaryLoading$ = this.store.select(PaymentsState.isSummaryLoading);
    this.summaryError$ = this.store.select(PaymentsState.hasSummaryError);
  }

  ngOnInit() {
    this.setupFilters();
    this.setupSearch();
  }

  ngAfterViewInit() {
    // Establecer las fechas después de que la vista esté completamente inicializada
    setTimeout(() => {
      this.setDefaultDateRange();
      this.loadPayments();
      this.loadSummary();
    }, 100);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilters() {
    // Watch for filter changes and apply automatically like before
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.currentFilters = {
          ...this.currentFilters,
          page: 1,
          startDate: value.startDate ? this.formatDateForApi(value.startDate) : undefined,
          endDate: value.endDate ? this.formatDateForApi(value.endDate) : undefined,
          searchQ: this.searchControl.value?.trim() || undefined
        };
        this.loadPayments();
        this.loadSummary();
      });
  }

  private setupSearch() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.currentFilters = {
          ...this.currentFilters,
          page: 1,
          searchQ: searchTerm?.trim() || undefined
        };
        this.loadPayments();
      });
  }

  private setDefaultDateRange() {
    // Las fechas ya están inicializadas en el constructor
    // Solo necesitamos actualizar los filtros internos
    this.currentFilters = {
      ...this.currentFilters,
      startDate: this.startDate ? this.formatDateForApi(this.startDate) : undefined,
      endDate: this.endDate ? this.formatDateForApi(this.endDate) : undefined
    };
    
    console.log('Default dates set:', {
      startDate: this.startDate,
      endDate: this.endDate,
      filters: this.currentFilters
    });
  }

  private formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  }

  loadPayments() {
    // If there's a search query, use search action, otherwise use regular getPayments
    if (this.currentFilters.searchQ?.trim()) {
      this.store.dispatch(new SearchPaymentsByName(this.currentFilters.searchQ, this.currentFilters));
    } else {
      this.store.dispatch(new GetPayments(this.currentFilters));
    }
  }

  loadSummary() {
    const startDate = this.currentFilters.startDate;
    const endDate = this.currentFilters.endDate;
    this.store.dispatch(new GetPaymentsSummary(startDate, endDate));
  }

  onPageChange(event: PageEvent) {
    this.currentFilters = {
      ...this.currentFilters,
      page: event.pageIndex + 1, // Convert to 1-based indexing for API
      limit: event.pageSize
    };
    this.loadPayments();
  }

  onSearch(searchQuery: { searchQ: string }): void {
    this.currentFilters = {
      ...this.currentFilters,
      page: 1, // Reset to first page when searching
      searchQ: searchQuery.searchQ?.trim()
    };

    // If search query is empty, use regular getPayments, otherwise use search
    if (!this.currentFilters.searchQ) {
      this.store.dispatch(new GetPayments(this.currentFilters));
    } else {
      this.store.dispatch(new SearchPaymentsByName(this.currentFilters.searchQ, this.currentFilters));
    }
  }

  applySearch() {
    const searchTerm = this.searchControl.value?.trim();
    this.currentFilters = {
      ...this.currentFilters,
      page: 1,
      searchQ: searchTerm || undefined
    };
    this.loadPayments();
  }

  applyFilters() {
    const formValues = this.filterForm.value;
    this.currentFilters = {
      ...this.currentFilters,
      page: 1,
      startDate: this.startDate ? this.formatDateForApi(this.startDate) : undefined,
      endDate: this.endDate ? this.formatDateForApi(this.endDate) : undefined,
      searchQ: this.searchControl.value?.trim() || undefined
    };
    this.loadPayments();
    this.loadSummary();
  }

  onDateChange() {
    // Se ejecuta cuando cambian las fechas via ngModel
    this.currentFilters = {
      ...this.currentFilters,
      page: 1,
      startDate: this.startDate ? this.formatDateForApi(this.startDate) : undefined,
      endDate: this.endDate ? this.formatDateForApi(this.endDate) : undefined,
      searchQ: this.searchControl.value?.trim() || undefined
    };
    this.loadPayments();
    this.loadSummary();
  }


  refreshData() {
    this.loadPayments();
    this.loadSummary();
  }

  clearFilters() {
    // Reset search query and filters
    this.searchControl.setValue('', { emitEvent: false });
    this.currentFilters = {
      page: 1,
      limit: 8,
      searchQ: undefined
    };
    this.activeQuickFilter = null;
    
    // Restablecer las fechas al mes completo
    const today = new Date();
    this.startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    this.endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Aplicar los cambios
    this.onDateChange();
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-UY').format(value);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU'
    }).format(amount);
  }

  setQuickFilter(period: 'today' | 'week' | 'month') {
    this.activeQuickFilter = period;
    const today = new Date();
    let startDate: Date;
    let endDate: Date = new Date(today);

    switch (period) {
      case 'today':
        startDate = new Date(today);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        break;
      default:
        return;
    }

    // Actualizar las propiedades directamente
    this.startDate = startDate;
    this.endDate = endDate;

    // Aplicar los filtros
    this.onDateChange();
  }

  onViewClientDetail(clientId: string) {
    this.router.navigate([`/clientes/detalle/${clientId}`]);
  }

  onEditPayment(payment: PaymentItem) {
    const dialogRef = this.dialog.open(EditPaymentDialogComponent, {
      width: '500px',
      data: { payment },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(newAmount => {
      if (newAmount !== undefined && newAmount !== payment.amount) {
        // Usuario guardó un nuevo monto
        this.updatePayment(payment, newAmount);
      }
    });
  }

  onDeletePayment(payment: PaymentItem) {
    const dialogRef = this.dialog.open(DeletePaymentDialogComponent, {
      width: '400px',
      data: { payment },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // Usuario confirmó la eliminación
        this.deletePayment(payment);
      }
    });
  }

  private deletePayment(payment: PaymentItem) {
    this.store.dispatch(new DeletePayment(payment._id)).subscribe(() => {
      // Reload summary after successful deletion
      this.loadSummary();
    });
  }

  private updatePayment(payment: PaymentItem, newAmount: number) {
    this.store.dispatch(new UpdatePayment(payment._id, newAmount)).subscribe(() => {
      // Reload summary after successful update
      this.loadSummary();
    });
  }
}