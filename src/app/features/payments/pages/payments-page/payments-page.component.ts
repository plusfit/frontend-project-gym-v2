import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
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
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { Subject, takeUntil, debounceTime, Observable, finalize } from 'rxjs';
import { Store, Actions, ofActionSuccessful } from '@ngxs/store';

import { PaymentsState } from '../../state/payments.state';
import {
  GetPayments,
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
    PaymentsTableComponent,
    MatPaginatorModule
  ],
  templateUrl: './payments-page.component.html',
  styleUrls: ['./payments-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentsPageComponent implements OnInit, OnDestroy {
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
  currentFilters: PaymentsFilters = {
    page: 1,
    limit: 8
  };

  constructor(
    private store: Store,
    private actions: Actions,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      startDate: [null],
      endDate: [null]
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
    this.setDefaultDateRange();
    this.setupFilters();
    this.loadPayments();
    this.loadSummary();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilters() {
    // Watch for filter changes
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.applyFilters(value);
      });
  }

  private setDefaultDateRange() {
    const today = new Date();

    // Primer día del mes actual
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Último día del mes actual
    // El día 0 del siguiente mes es el último día del mes actual
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Establecer las fechas en el formulario
    this.filterForm.patchValue({
      startDate: firstDayOfMonth,
      endDate: lastDayOfMonth
    }, { emitEvent: false }); // emitEvent: false para evitar trigger inmediato

    // También actualizar los filtros internos
    this.currentFilters = {
      ...this.currentFilters,
      startDate: this.formatDateForApi(firstDayOfMonth),
      endDate: this.formatDateForApi(lastDayOfMonth)
    };
  }

  private applyFilters(filterValues: any) {
    this.currentFilters = {
      ...this.currentFilters,
      page: 1, // Reset to first page when filters change
      startDate: filterValues.startDate ? this.formatDateForApi(filterValues.startDate) : undefined,
      endDate: filterValues.endDate ? this.formatDateForApi(filterValues.endDate) : undefined
    };

    this.loadPayments();
    this.loadSummary();
  }

  private formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  }

  loadPayments() {
    this.store.dispatch(new GetPayments(this.currentFilters));
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


  refreshData() {
    this.loadPayments();
    this.loadSummary();
  }

  clearFilters() {
    // En lugar de reset completo, establecer las fechas del mes actual
    this.setDefaultDateRange();
    this.loadPayments();
    this.loadSummary();
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
    const today = new Date();
    let startDate: Date;
    let endDate: Date = today;

    switch (period) {
      case 'today':
        startDate = new Date(today);
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

    this.filterForm.patchValue({
      startDate: startDate,
      endDate: endDate
    });
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