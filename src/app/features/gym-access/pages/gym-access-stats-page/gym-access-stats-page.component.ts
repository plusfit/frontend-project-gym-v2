import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { Subject, takeUntil, finalize } from 'rxjs';

import { LoadingOverlayService } from '@core/services/loading-overlay.service';
import { SnackBarService } from '@core/services/snackbar.service';
import { TitleComponent } from '@shared/components/title/title.component';

import { AccessStatsDashboardComponent } from '../../components/access-stats-dashboard/access-stats-dashboard.component';
import { GymAccessAdminService } from '../../services/gym-access-admin.service';
import {
  GymAccessStats,
  StatsPeriod,
  GymAccessStatsResponse
} from '../../interfaces/gym-access-admin.interface';

@Component({
  selector: 'app-gym-access-stats-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatCardModule,
    TitleComponent,
    AccessStatsDashboardComponent
  ],
  templateUrl: './gym-access-stats-page.component.html',
  styleUrls: ['./gym-access-stats-page.component.css']
})
export class GymAccessStatsPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Component state
  stats: GymAccessStats | null = null;
  loading = false;
  
  // Period configuration
  period: StatsPeriod = {
    startDate: '',
    endDate: '',
    period: 'daily'
  };

  // Local date values for form controls
  localStartDate: Date | null = null;
  localEndDate: Date | null = null;
  selectedPeriod: 'daily' | 'weekly' | 'monthly' = 'daily';

  // Period options
  periodOptions = [
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' }
  ];

  // Quick period options
  quickPeriods = [
    { label: 'Última Semana', days: 7 },
    { label: 'Último Mes', days: 30 },
    { label: 'Últimos 3 Meses', days: 90 },
    { label: 'Último Año', days: 365 }
  ];

  constructor(
    private gymAccessAdminService: GymAccessAdminService,
    private loadingOverlayService: LoadingOverlayService,
    private snackbarService: SnackBarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeDefaultPeriod();
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize default period (last 30 days)
   */
  private initializeDefaultPeriod(): void {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    this.localStartDate = startDate;
    this.localEndDate = endDate;
    this.selectedPeriod = 'daily';

    this.updatePeriod();
  }

  /**
   * Update period object from local values
   */
  private updatePeriod(): void {
    this.period = {
      startDate: this.localStartDate ? this.formatDateForApi(this.localStartDate) : '',
      endDate: this.localEndDate ? this.formatDateForApi(this.localEndDate) : '',
      period: this.selectedPeriod
    };
  }

  /**
   * Load statistics with current period
   */
  loadStats(): void {
    this.loading = true;

    this.gymAccessAdminService.getAccessStats(this.period)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response: GymAccessStatsResponse) => {
          if (response.success) {
            this.stats = response.data;
          } else {
            this.showError('Error al cargar las estadísticas');
            this.stats = null;
          }
        },
        error: (error) => {
          console.error('Error loading stats:', error);
          this.showError('Error al cargar las estadísticas');
          this.stats = null;
        }
      });
  }

  /**
   * Handle period change
   */
  onPeriodChange(): void {
    this.updatePeriod();
    this.loadStats();
  }

  /**
   * Handle start date change
   */
  onStartDateChange(): void {
    if (this.localStartDate && this.localEndDate && this.localStartDate > this.localEndDate) {
      this.localEndDate = new Date(this.localStartDate);
    }
    this.updatePeriod();
  }

  /**
   * Handle end date change
   */
  onEndDateChange(): void {
    if (this.localStartDate && this.localEndDate && this.localEndDate < this.localStartDate) {
      this.localStartDate = new Date(this.localEndDate);
    }
    this.updatePeriod();
  }

  /**
   * Apply period filters
   */
  applyPeriod(): void {
    if (!this.localStartDate || !this.localEndDate) {
      this.showError('Por favor seleccione las fechas de inicio y fin');
      return;
    }

    if (this.localStartDate > this.localEndDate) {
      this.showError('La fecha de inicio no puede ser mayor a la fecha de fin');
      return;
    }

    this.updatePeriod();
    this.loadStats();
  }

  /**
   * Set quick period
   */
  setQuickPeriod(days: number): void {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    this.localStartDate = startDate;
    this.localEndDate = endDate;
    
    // Auto-select appropriate period based on days
    if (days <= 7) {
      this.selectedPeriod = 'daily';
    } else if (days <= 90) {
      this.selectedPeriod = 'weekly';
    } else {
      this.selectedPeriod = 'monthly';
    }

    this.updatePeriod();
    this.loadStats();
  }

  /**
   * Navigate back to history page
   */
  navigateToHistory(): void {
    this.router.navigate(['/historial-accesos']);
  }

  /**
   * Refresh data
   */
  refreshData(): void {
    this.loadStats();
    this.showSuccess('Estadísticas actualizadas');
  }

  /**
   * Export stats report
   */
  exportStatsReport(): void {
    this.loadingOverlayService.show();

    // Create filters based on current period
    const filters = {
      page: 1,
      limit: 1000, // Get all records for export
      startDate: this.period.startDate,
      endDate: this.period.endDate
    };

    const exportOptions = {
      format: 'excel' as const,
      filters,
      includeStats: true
    };

    this.gymAccessAdminService.exportAccessHistory(exportOptions)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingOverlayService.hide())
      )
      .subscribe({
        next: (blob: Blob) => {
          const filename = this.generateStatsReportFilename();
          this.gymAccessAdminService.downloadFile(blob, filename);
          this.showSuccess('Reporte de estadísticas descargado exitosamente');
        },
        error: (error) => {
          console.error('Error exporting stats report:', error);
          this.showError('Error al exportar el reporte de estadísticas');
        }
      });
  }

  /**
   * Generate filename for stats report
   */
  private generateStatsReportFilename(): string {
    const startDate = this.period.startDate || 'inicio';
    const endDate = this.period.endDate || 'fin';
    const today = new Date().toISOString().split('T')[0];
    
    return `estadisticas-accesos-${startDate}-${endDate}-${today}.xlsx`;
  }

  /**
   * Format date for API
   */
  private formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Format date for display
   */
  formatDisplayDate(date: Date): string {
    return date.toLocaleDateString('es-UY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Get period description
   */
  getPeriodDescription(): string {
    if (!this.localStartDate || !this.localEndDate) {
      return 'Seleccione un período';
    }

    const start = this.formatDisplayDate(this.localStartDate);
    const end = this.formatDisplayDate(this.localEndDate);
    
    const diffTime = Math.abs(this.localEndDate.getTime() - this.localStartDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return `${start} - ${end} (${diffDays} día${diffDays !== 1 ? 's' : ''})`;
  }

  /**
   * Check if period is valid
   */
  isPeriodValid(): boolean {
    return !!(this.localStartDate && this.localEndDate && this.localStartDate <= this.localEndDate);
  }

  /**
   * Get page title
   */
  getPageTitle(): string {
    return 'Estadísticas de Accesos';
  }

  /**
   * Get page subtitle
   */
  getPageSubtitle(): string {
    return 'Análisis y métricas de acceso al gimnasio';
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
   * Get max date for date pickers (today)
   */
  getMaxDate(): Date {
    return new Date();
  }

  /**
   * Get selected period label
   */
  getSelectedPeriodLabel(): string {
    const option = this.periodOptions.find(p => p.value === this.selectedPeriod);
    return option?.label?.toLowerCase() || '';
  }

  /**
   * Check if has data to show
   */
  hasData(): boolean {
    return !!(this.stats && !this.loading);
  }
}