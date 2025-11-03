import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { Subject, takeUntil, finalize, debounceTime } from 'rxjs';

import { PaymentsTableComponent } from '../../components/payments-table/payments-table.component';
import { DeletePaymentDialogComponent } from '../../components/delete-payment-dialog/delete-payment-dialog.component';
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
    PaymentsTableComponent
  ],
  templateUrl: './payments-page.component.html',
  styleUrls: ['./payments-page.component.css']
})
export class PaymentsPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Component state
  payments: PaymentItem[] = [];
  loading = false;
  totalCount = 0;
  currentPage = 0;
  pageSize = 10;
  hasError = false;
  errorMessage = '';

  // Statistics
  stats: PaymentsStats | null = null;
  statsLoading = false;
  statsError = false;

  // Summary
  summary: PaymentsSummary | null = null;
  summaryLoading = false;
  summaryError = false;

  // Filters
  filterForm: FormGroup;
  currentFilters: PaymentsFilters = {
    page: 1,
    limit: 10
  };

  constructor(
    private paymentsService: PaymentsService,
    private snackBarService: SnackBarService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.filterForm = this.fb.group({
      startDate: [null],
      endDate: [null]
    });
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

    this.currentPage = 0;
    this.loadPayments();
    this.loadSummary();
  }

  private formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  }

  loadPayments() {
    this.loading = true;
    this.hasError = false;

    this.paymentsService.getPayments(this.currentFilters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {

          this.payments = response.data.data;
          this.totalCount = response.data.pagination.totalCount;
          this.currentPage = response.data.pagination.currentPage - 1; // Material paginator uses 0-based indexing
        },
        error: (error) => {
          this.hasError = true;
          this.errorMessage = 'Error al cargar los pagos. Por favor, inténtelo de nuevo.';
          this.snackBarService.showError('Error al cargar los pagos', 'Cerrar');
          this.payments = [];
          this.totalCount = 0;
        }
      });
  }

  loadStats() {
    this.statsLoading = true;
    this.statsError = false;

    const startDate = this.currentFilters.startDate;
    const endDate = this.currentFilters.endDate;

    this.paymentsService.getPaymentsStats(startDate, endDate)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.statsLoading = false)
      )
      .subscribe({
        next: (stats) => {
          this.stats = stats;
        },
        error: (error) => {
          console.error('Error loading payments stats:', error);
          this.statsError = true;
          this.stats = null;
        }
      });
  }

  loadSummary() {
    this.summaryLoading = true;
    this.summaryError = false;

    const startDate = this.currentFilters.startDate;
    const endDate = this.currentFilters.endDate;



    this.paymentsService.getPaymentsSummary(startDate, endDate)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.summaryLoading = false)
      )
      .subscribe({
        next: (summary) => {

          this.summary = summary;
        },
        error: (error) => {
          console.error('Error loading payments summary:', error);
          this.summaryError = true;
          this.summary = null;
        }
      });
  }

  onPageChange(event: PageEvent) {
    this.currentFilters = {
      ...this.currentFilters,
      page: event.pageIndex + 1, // Convert to 1-based indexing for API
      limit: event.pageSize
    };
    this.pageSize = event.pageSize;
    this.loadPayments();
  }

  onExportData(format: 'csv' | 'excel') {
    this.paymentsService.exportPayments(this.currentFilters, format)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `pagos_${new Date().toISOString().split('T')[0]}.${format}`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.snackBarService.showSuccess('Archivo descargado exitosamente', 'Cerrar');
        },
        error: (error) => {
          console.error('Error exporting payments:', error);
          this.snackBarService.showError('Error al exportar los datos', 'Cerrar');
        }
      });
  }

  refreshData() {
    this.loadPayments();
    this.loadSummary();
  }

  clearFilters() {
    // En lugar de reset completo, establecer las fechas del mes actual
    this.setDefaultDateRange();
    this.currentPage = 0;
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

  onEditPayment(payment: PaymentItem) {
    console.log('Editing payment:', payment);
    // TODO: Implementar la lógica de edición
    // Ejemplo: abrir un dialog de edición
    this.snackBarService.showSuccess(`Editando pago de ${payment.clientName}`, 'Cerrar');
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
    this.paymentsService.deletePayment(payment._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Payment deleted successfully:', response);
          this.snackBarService.showSuccess(
            `Pago de ${payment.clientName} eliminado correctamente`,
            'Cerrar'
          );
          // Recargar los datos
          this.loadPayments();
          this.loadSummary();
        },
        error: (error) => {
          console.error('Error deleting payment:', error);
          this.snackBarService.showError(
            'Error al eliminar el pago. Por favor, inténtelo de nuevo.',
            'Cerrar'
          );
        }
      });
  }
}