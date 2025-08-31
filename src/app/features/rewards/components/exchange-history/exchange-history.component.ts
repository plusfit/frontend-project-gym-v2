import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Exchange, ExchangeFilters } from '../../interfaces/exchange.interface';
import { ExchangesService } from '../../services/exchanges.service';

@Component({
  selector: 'app-exchange-history',
  templateUrl: './exchange-history.component.html'
})
export class ExchangeHistoryComponent implements OnInit {
  displayedColumns: string[] = [
    'date',
    'client', 
    'reward',
    'pointsUsed',
    'status'
  ];

  data: Exchange[] = [];
  loading = false;
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  filteredData = false;

  // Expose Math to template
  Math = Math;

  // Filtros
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
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.setupFilters();
    this.loadExchanges();
  }


  private setupFilters(): void {
    // Filtro de búsqueda con debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.resetPagination();
        this.loadExchanges();
      });

    // Filtro de estado
    this.statusFilter.valueChanges.subscribe(() => {
      this.resetPagination();
      this.loadExchanges();
    });

    // Filtros de fecha
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

    // Apply any additional filters based on current sorting requirements
    // Sorting will be handled by backend if needed

    this.exchangesService.getExchangeHistory(filters).subscribe({
      next: (response: any) => {
        console.log('Exchange History API Response:', response);
        if (response && response.success && response.data) {
          // La respuesta tiene estructura anidada: response.data contiene success, data y pagination
          const exchangesData = response.data.data || [];
          const paginationData = response.data.pagination || {};
          
          this.data = exchangesData;
          this.totalItems = paginationData.totalCount || 0;
          this.filteredData = !!(searchValue || (statusValue && statusValue !== 'all') || this.dateFromControl.value || this.dateToControl.value);
        } else {
          console.warn('Invalid response structure:', response);
          this.data = [];
          this.totalItems = 0;
          this.filteredData = false;
          this.showSnackBar('Respuesta inválida del servidor', 'warning');
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading exchanges:', error);
        this.showSnackBar('Error al cargar el historial de canjes. Verifique que el backend esté funcionando.');
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

  exportToExcel(): void {
    // Implementar exportación a Excel
    this.showSnackBar('Funcionalidad de exportación en desarrollo', 'warning');
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
    
    // Verificar si la fecha es válida
    if (isNaN(dateObj.getTime())) {
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

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadExchanges();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.currentPage = 0;
    this.loadExchanges();
  }

  private showSnackBar(message: string, type: 'success' | 'error' | 'warning' = 'error'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`${type}-snackbar`]
    });
  }
}