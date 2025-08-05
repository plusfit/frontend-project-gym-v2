import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { Subject, takeUntil, finalize } from 'rxjs';

import { LoadingOverlayService } from '@core/services/loading-overlay.service';
import { SnackBarService } from '@core/services/snackbar.service';
import { TitleComponent } from '@shared/components/title/title.component';

import { AccessHistoryTableComponent } from '../../components/access-history-table/access-history-table.component';
import { GymAccessAdminService } from '../../services/gym-access-admin.service';
import {
  GymAccessHistoryItem,
  AccessFilters,
  GymAccessHistoryResponse
} from '../../interfaces/gym-access-admin.interface';

@Component({
  selector: 'app-gym-access-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    TitleComponent,
    AccessHistoryTableComponent
  ],
  templateUrl: './gym-access-page.component.html',
  styleUrls: ['./gym-access-page.component.css']
})
export class GymAccessPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Component state
  accessHistory: GymAccessHistoryItem[] = [];
  loading = false;
  totalCount = 0;
  currentPage = 0;
  pageSize = 10;
  
  // Current filters
  filters: AccessFilters = {
    page: 1,
    limit: 10
  };

  // Quick stats for dashboard summary
  todayStats = {
    totalAccesses: 0,
    successfulAccesses: 0,
    uniqueClients: 0,
    successRate: 0
  };

  constructor(
    private gymAccessAdminService: GymAccessAdminService,
    private loadingOverlayService: LoadingOverlayService,
    private snackbarService: SnackBarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAccessHistory();
    this.loadTodayStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load access history with current filters
   */
  loadAccessHistory(): void {
    this.loading = true;
    
    this.gymAccessAdminService.getAccessHistory(this.filters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response: GymAccessHistoryResponse) => {
          if (response.success && response.data && response.data.pagination) {
            this.accessHistory = response.data.history || [];
            this.totalCount = response.data.pagination.totalCount || 0;
            this.currentPage = (response.data.pagination.currentPage || 1) - 1; // Mat-paginator is 0-indexed
            this.pageSize = response.data.pagination.limit || 10;
          } else {
            this.showError('Error al cargar el historial de accesos');
            this.accessHistory = [];
            this.totalCount = 0;
          }
        },
        error: (error) => {
          console.error('Error loading access history:', error);
          this.showError('Error al cargar el historial de accesos');
          this.accessHistory = [];
          this.totalCount = 0;
        }
      });
  }

  /**
   * Load today's quick stats
   */
  loadTodayStats(): void {
    this.gymAccessAdminService.getTodaysStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data.overview) {
            this.todayStats = {
              totalAccesses: response.data.overview.totalAccessesToday,
              successfulAccesses: response.data.overview.totalAccessesToday * response.data.overview.averageSuccessRate / 100,
              uniqueClients: response.data.overview.uniqueClientsToday,
              successRate: response.data.overview.averageSuccessRate
            };
          }
        },
        error: (error) => {
          console.error('Error loading today stats:', error);
        }
      });
  }

  /**
   * Handle filter changes from the table component
   */
  onFiltersChange(newFilters: AccessFilters): void {
    this.filters = { ...newFilters };
    this.loadAccessHistory();
  }

  /**
   * Handle page change events
   */
  onPageChange(event: PageEvent): void {
    this.filters = {
      ...this.filters,
      page: event.pageIndex + 1, // Convert to 1-indexed
      limit: event.pageSize
    };
    this.loadAccessHistory();
  }

  /**
   * Handle sort change events
   */
  onSortChange(sort: Sort): void {
    // Add sorting logic if backend supports it
    // For now, we'll just reload the data
    this.loadAccessHistory();
  }

  /**
   * Handle export data requests
   */
  onExportData(format: string): void {
    this.loadingOverlayService.show();
    
    const exportOptions = {
      format: format as 'csv' | 'excel',
      filters: this.filters,
      includeStats: true
    };

    this.gymAccessAdminService.exportAccessHistory(exportOptions)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingOverlayService.hide())
      )
      .subscribe({
        next: (blob: Blob) => {
          const filename = this.gymAccessAdminService.generateExportFilename(format, this.filters);
          this.gymAccessAdminService.downloadFile(blob, filename);
          this.showSuccess(`Archivo ${format.toUpperCase()} descargado exitosamente`);
        },
        error: (error) => {
          console.error('Error exporting data:', error);
          this.showError('Error al exportar los datos');
        }
      });
  }

  /**
   * Handle view client detail requests
   */
  onViewClientDetail(cedula: string): void {
    // Navigate to client detail page
    this.router.navigate(['/clientes/detalle', cedula]);
  }

  /**
   * Navigate to statistics page
   */
  navigateToStats(): void {
    this.router.navigate(['/estadisticas-accesos']);
  }

  /**
   * Refresh data
   */
  refreshData(): void {
    this.loadAccessHistory();
    this.loadTodayStats();
    this.showSuccess('Datos actualizados');
  }

  /**
   * Get success rate color class
   */
  getSuccessRateColorClass(): string {
    const rate = this.todayStats.successRate;
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  }

  /**
   * Get success rate background class
   */
  getSuccessRateBgClass(): string {
    const rate = this.todayStats.successRate;
    if (rate >= 95) return 'bg-green-50';
    if (rate >= 85) return 'bg-yellow-50';
    return 'bg-red-50';
  }

  /**
   * Format percentage
   */
  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  /**
   * Format number with commas
   */
  formatNumber(value: number): string {
    return value.toLocaleString('es-UY');
  }

  /**
   * Show success message
   */
  private showSuccess(message: string): void {
    this.snackbarService.showSuccess('Éxito', message);
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    this.snackbarService.showError('Error', message);
  }

  /**
   * Get page title
   */
  getPageTitle(): string {
    return 'Historial de Accesos al Gimnasio';
  }

  /**
   * Get page subtitle
   */
  getPageSubtitle(): string {
    return 'Gestión y seguimiento de accesos de clientes';
  }

  /**
   * Check if there are any records
   */
  hasRecords(): boolean {
    return this.accessHistory && this.accessHistory.length > 0;
  }

  /**
   * Get total records text
   */
  getTotalRecordsText(): string {
    if (!this.totalCount || this.totalCount === 0) {
      return 'Sin registros';
    }
    
    if (this.totalCount === 1) {
      return '1 registro';
    }
    
    return `${this.formatNumber(this.totalCount)} registros`;
  }

  /**
   * Get current page info
   */
  getCurrentPageInfo(): string {
    if (!this.totalCount || this.totalCount === 0) {
      return '';
    }
    
    const startIndex = this.currentPage * this.pageSize + 1;
    const endIndex = Math.min((this.currentPage + 1) * this.pageSize, this.totalCount);
    
    return `Mostrando ${startIndex}-${endIndex} de ${this.formatNumber(this.totalCount)}`;
  }
}