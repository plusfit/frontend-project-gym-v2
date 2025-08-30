import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
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
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'date',
    'client',
    'reward',
    'pointsUsed',
    'status'
  ];

  dataSource = new MatTableDataSource<Exchange>([]);
  loading = false;
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;

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

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Configurar paginación
    this.paginator.page.subscribe(() => {
      this.currentPage = this.paginator.pageIndex;
      this.pageSize = this.paginator.pageSize;
      this.loadExchanges();
    });

    // Configurar ordenamiento
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.currentPage = 0;
      this.loadExchanges();
    });
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
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
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

    // Aplicar ordenamiento
    if (this.sort?.active && this.sort?.direction) {
      filters.sortBy = this.sort.active;
      filters.sortOrder = this.sort.direction;
    }

    this.exchangesService.getExchangeHistory(filters).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.dataSource.data = response.data;
          this.totalItems = response.pagination.totalCount;
        } else {
          this.showSnackBar('Error al cargar el historial de canjes');
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading exchanges:', error);
        this.showSnackBar('Error al cargar el historial de canjes');
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
    this.showSnackBar('Funcionalidad de exportación en desarrollo');
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
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}