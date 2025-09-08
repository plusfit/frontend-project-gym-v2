import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { SnackBarService } from '@core/services/snackbar.service';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Exchange, ExchangeFilters, ExchangeResponse } from '../../interfaces/exchange.interface';
import { ExchangesService } from '../../services/exchanges.service';

@Component({
  selector: 'app-exchange-history',
  templateUrl: './exchange-history.component.html'
})
export class ExchangeHistoryComponent implements OnInit {
  displayedColumns: string[] = [
    'image',
    'date',
    'client',
    'reward',
    'pointsUsed',
    'status',
    'acciones'
  ];

  data: Exchange[] = [];
  loading = false;
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  filteredData = false;

  Math = Math;

  searchControl = new FormControl('');
  statusFilter = new FormControl('all');
  dateFromControl = new FormControl();
  dateToControl = new FormControl();

  statusOptions = [
    { value: 'all', label: 'Todos los Estados' },
    { value: 'completed', label: 'Completados' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'cancelled', label: 'Cancelados' }
  ];

  constructor(
    private exchangesService: ExchangesService,
    private snackBarService: SnackBarService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.setupFilters();
    this.loadExchanges();
  }


  private setupFilters(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.resetPagination();
        this.loadExchanges();
      });

    this.statusFilter.valueChanges.subscribe(() => {
      this.resetPagination();
      this.loadExchanges();
    });

    this.dateFromControl.valueChanges.subscribe(() => {
      this.resetPagination();
      this.loadExchanges();
    });

    this.dateToControl.valueChanges.subscribe(() => {
      this.resetPagination();
      this.loadExchanges();
    });
  }

  private resetPagination(): void {
    this.currentPage = 0;
  }

  loadExchanges(): void {
    this.loading = true;

    const filters: ExchangeFilters = {
      page: this.currentPage + 1,
      limit: this.pageSize
    };

    // Aplicar filtros
    const searchValue = this.searchControl.value?.trim();
    if (searchValue) {
      filters.search = searchValue;
    }

    const statusValue = this.statusFilter.value as 'completed' | 'pending' | 'cancelled' | 'all';
    if (statusValue && statusValue !== 'all') {
      filters.status = statusValue;
    }

    if (this.dateFromControl.value) {
      filters.dateFrom = this.dateFromControl.value;
    }

    if (this.dateToControl.value) {
      filters.dateTo = this.dateToControl.value;
    }

    this.exchangesService.getExchangeHistory(filters).subscribe({
      next: (response) => {
        if (response?.success && response?.data && typeof response.data === 'object' && 'data' in response.data && 'pagination' in response.data) {
          const innerData = response.data as ExchangeResponse['data'];
          const exchangesData = innerData.data || [];
          const paginationData = innerData.pagination || {};
          
          this.data = exchangesData;
          this.totalItems = paginationData.totalCount || 0;
          this.filteredData = !!(searchValue || (statusValue && statusValue !== 'all') || this.dateFromControl.value || this.dateToControl.value);
        } else {
          this.data = [];
          this.totalItems = 0;
          this.filteredData = false;
          this.showSnackBar('Advertencia', 'Respuesta inválida del servidor', 'warning');
        }
        this.loading = false;
      },
      error: (error) => {
        this.showSnackBar('Error', 'Error al cargar el historial de canjes. Verifique que el backend esté funcionando.', 'error');
        this.data = [];
        this.totalItems = 0;
        this.filteredData = false;
        this.loading = false;
      }
    });
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.statusFilter.setValue('all');
    this.dateFromControl.setValue(null);
    this.dateToControl.setValue(null);
    this.resetPagination();
    this.loadExchanges();
  }



  getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'primary';
      case 'pending':
        return 'accent';
      case 'cancelled':
        return 'warn';
      default:
        return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (Number.isNaN(dateObj.getTime())) {
      return 'Fecha inválida';
    }
    
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onPageEvent(event: PageEvent): void {
    if (event.pageSize !== this.pageSize) {
      this.currentPage = 0;
      this.pageSize = event.pageSize;
    } else {
      this.currentPage = event.pageIndex;
    }
    this.loadExchanges();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadExchanges();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.currentPage = 0;
    this.loadExchanges();
  }

  private showSnackBar(title: string, message: string, type: 'success' | 'error' | 'warning' = 'error'): void {
    switch (type) {
      case 'success':
        this.snackBarService.showSuccess(title, message);
        break;
      case 'error':
        this.snackBarService.showError(title, message);
        break;
      case 'warning':
        this.snackBarService.showWarning(title, message);
        break;
    }
  }

  // ========== MÉTODOS PARA CAMBIO DE ESTADO ==========

  onChangeStatus(exchange: Exchange): void {
    const availableStatuses = this.getAvailableStatusTransitions(exchange.status);
    
    if (availableStatuses.length === 0) {
      this.showSnackBar('Información', 'No hay cambios de estado disponibles para este canje', 'warning');
      return;
    }

    // Si hay solo un estado disponible, usar directamente
    if (availableStatuses.length === 1) {
      this.confirmStatusChange(exchange, availableStatuses[0]);
      return;
    }

    // Si hay múltiples estados, mostrar opciones
    // Por simplicidad, usaremos el primer estado disponible
    // En una implementación más compleja, podrías mostrar un dialog con opciones
    this.confirmStatusChange(exchange, availableStatuses[0]);
  }

  private getAvailableStatusTransitions(currentStatus: string): Array<{ value: 'completed' | 'pending' | 'cancelled', label: string }> {
    switch (currentStatus) {
      case 'pending':
        return [
          { value: 'completed', label: 'Completar' },
          { value: 'cancelled', label: 'Cancelar' }
        ];
      case 'completed':
        return [
          { value: 'cancelled', label: 'Cancelar' }
        ];
      case 'cancelled':
        return []; // No se puede cambiar desde cancelado
      default:
        return [];
    }
  }

  private confirmStatusChange(exchange: Exchange, newStatus: { value: 'completed' | 'pending' | 'cancelled', label: string }): void {
    const currentStatusText = this.getStatusText(exchange.status);
    const newStatusText = newStatus.label;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar Cambio de Estado',
        contentMessage: `¿Está seguro que desea cambiar el estado del canje de "${currentStatusText}" a "${newStatusText}"?`,
        icon: 'swap_horiz',
        iconColor: 'blue',
        confirmButtonText: 'Confirmar Cambio'
      }
    });

    dialogRef.componentInstance.confirm.subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.updateExchangeStatus(exchange.id, newStatus.value);
      }
    });
  }

  private updateExchangeStatus(exchangeId: string, newStatus: 'completed' | 'pending' | 'cancelled'): void {
    this.loading = true;

    this.exchangesService.updateExchangeStatus(exchangeId, newStatus).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSnackBar('Éxito', response.message, 'success');
          this.loadExchanges(); // Recargar la lista
        } else {
          this.showSnackBar('Error', 'No se pudo actualizar el estado del canje', 'error');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error updating exchange status:', error);
        const errorMessage = error?.error?.message || 'Error al actualizar el estado del canje';
        this.showSnackBar('Error', errorMessage, 'error');
        this.loading = false;
      }
    });
  }

  // Método para que el componente table pueda usar para mostrar los cambios de estado
  onEdit(exchangeId: string): void {
    const exchange = this.data.find(ex => ex.id === exchangeId);
    if (exchange) {
      this.onChangeStatus(exchange);
    }
  }
}