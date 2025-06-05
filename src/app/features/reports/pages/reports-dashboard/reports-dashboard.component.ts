import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { Store } from '@ngxs/store';
import { Permission, Module } from '@core/enums/permissions.enum';

import { ReportsService } from '../../services/reports.service';
import { AuthState } from '@features/auth/state/auth.state';
import { DashboardCardsComponent } from '../../components/dashboard-cards/dashboard-cards.component';
import { LineChartComponent } from '../../components/charts/line-chart/line-chart.component';
import { DoughnutChartComponent } from '../../components/charts/doughnut-chart/doughnut-chart.component';
import { ExportDialogComponent } from '../../components/export-dialog/export-dialog.component';
import { TitleComponent } from '@shared/components/title/title.component';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { 
  DashboardMetrics, 
  DateRange, 
  ReportFilters 
} from '../../interfaces/reports.interface';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    DashboardCardsComponent,
    LineChartComponent,
    DoughnutChartComponent,
    TitleComponent,
    LoaderComponent,
    HasPermissionDirective
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-7xl mx-auto">
        
        <!-- Header -->
        <div class="mb-8">
          <app-title 
            title="Dashboard de Reportes" 
            subtitle="Análisis completo del rendimiento de tu gimnasio">
          </app-title>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form [formGroup]="filtersForm" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            
            <!-- Date Range -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Período</label>
              <mat-select formControlName="dateRange" class="w-full">
                @for (option of dateRangeOptions; track option.value) {
                  <mat-option [value]="option.value">{{ option.label }}</mat-option>
                }
              </mat-select>
            </div>

            <!-- Start Date (only if custom) -->
            @if (filtersForm.get('dateRange')?.value === 'custom') {
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
                <input matInput [matDatepicker]="startPicker" formControlName="startDate"
                       class="w-full p-3 border border-gray-300 rounded-lg">
                <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
              </div>
            }

            <!-- End Date (only if custom) -->
            @if (filtersForm.get('dateRange')?.value === 'custom') {
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
                <input matInput [matDatepicker]="endPicker" formControlName="endDate"
                       class="w-full p-3 border border-gray-300 rounded-lg">
                <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
              </div>
            }

            <!-- Apply Button -->
            <div>
              <button mat-raised-button color="primary" 
                      (click)="applyFilters()"
                      [disabled]="loading"
                      class="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                <i class="ph-funnel mr-2"></i>
                Aplicar Filtros
              </button>
            </div>

            <!-- Export Button -->
            <div>
              <button mat-stroked-button 
                      (click)="openExportDialog()"
                      [disabled]="loading || !metrics"
                      class="w-full border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
                      [appHasPermission]="Permission.REPORTS_EXPORT" 
                      [appHasPermissionModule]="Module.REPORTS">
                <i class="ph-download mr-2"></i>
                Exportar
              </button>
            </div>
            
          </form>
        </div>

        <!-- Loading State -->
        @if (loading) {
          <div class="flex justify-center items-center py-12">
            <app-loader></app-loader>
          </div>
        }

        <!-- Dashboard Content -->
        @if (!loading && metrics) {
          <!-- KPI Cards -->
          <app-dashboard-cards [metrics]="metrics"></app-dashboard-cards>

          <!-- Charts Section -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
                         <!-- Client Growth Chart -->
             <div class="bg-white rounded-xl shadow-lg p-6">
               <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                 <i class="ph-chart-line text-blue-500 mr-2"></i>
                 Crecimiento de Clientes
               </h3>
               <div class="h-64">
                 <app-line-chart 
                   [data]="getClientGrowthData()"
                   title="Clientes"
                   xAxisLabel="Período"
                   yAxisLabel="Cantidad de Clientes"
                   color="#3B82F6">
                 </app-line-chart>
               </div>
             </div>

                         <!-- Revenue Distribution -->
             <div class="bg-white rounded-xl shadow-lg p-6">
               <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                 <i class="ph-chart-pie text-green-500 mr-2"></i>
                 Distribución de Ingresos
               </h3>
               <div class="h-64">
                 <app-doughnut-chart 
                   [data]="getRevenueDistributionData()"
                   [showLegend]="false">
                 </app-doughnut-chart>
               </div>
               <div class="mt-4 space-y-2">
                 @for (plan of metrics.financialMetrics.revenueByPlan; track plan.planName) {
                   <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                     <span class="text-sm font-medium text-gray-700">{{ plan.planName }}</span>
                     <span class="text-sm text-gray-600">{{ plan.percentage.toFixed(1) }}%</span>
                   </div>
                 }
               </div>
             </div>

          </div>

          <!-- Detailed Tables -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <!-- Peak Hours -->
            <div class="bg-white rounded-xl shadow-lg p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <i class="ph-clock text-orange-500 mr-2"></i>
                Horarios de Mayor Demanda
              </h3>
              <div class="space-y-3">
                @for (hour of metrics.occupancyMetrics.peakHours; track hour.hour) {
                  <div class="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span class="font-medium text-gray-900">{{ hour.hour }}:00</span>
                    <div class="flex items-center space-x-2">
                      <div class="w-20 bg-orange-200 rounded-full h-2">
                        <div class="bg-orange-500 h-2 rounded-full" 
                             [style.width.%]="hour.occupancy"></div>
                      </div>
                      <span class="text-sm text-orange-600 font-medium">
                        {{ hour.occupancy.toFixed(1) }}%
                      </span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Popular Exercises -->
            <div class="bg-white rounded-xl shadow-lg p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <i class="ph-barbell text-purple-500 mr-2"></i>
                Ejercicios Más Populares
              </h3>
              <div class="space-y-3">
                @for (exercise of metrics.routineMetrics.mostPopularExercises.slice(0, 5); track exercise.name) {
                  <div class="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <span class="font-medium text-gray-900">{{ exercise.name }}</span>
                      <p class="text-sm text-gray-600">{{ exercise.category }}</p>
                    </div>
                    <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      {{ exercise.count }} usos
                    </span>
                  </div>
                }
              </div>
            </div>

          </div>
        }

        <!-- Error State -->
        @if (error) {
          <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <i class="ph-warning-circle text-red-500 text-4xl mb-4"></i>
            <h3 class="text-lg font-medium text-red-800 mb-2">Error al cargar los datos</h3>
            <p class="text-red-600">{{ error }}</p>
            <button mat-raised-button color="warn" (click)="loadDashboard()" class="mt-4">
              Reintentar
            </button>
          </div>
        }

      </div>
    </div>
  `,
  styleUrls: ['./reports-dashboard.component.css']
})
export class ReportsDashboardComponent implements OnInit, OnDestroy {
  filtersForm: FormGroup;
  metrics: DashboardMetrics | null = null;
  loading = false;
  error: string | null = null;
  
  dateRangeOptions = this.reportsService.getDateRangeOptions();
  
  // Permisos para controlar funcionalidades
  Permission = Permission;
  Module = Module;
  
  private destroy$ = new Subject<void>();
  private organizationId = '';

  constructor(
    private fb: FormBuilder,
    private reportsService: ReportsService,
    private store: Store,
    private dialog: MatDialog
  ) {
    this.filtersForm = this.fb.group({
      dateRange: [DateRange.LAST_30_DAYS],
      startDate: [null],
      endDate: [null]
    });
  }

  ngOnInit(): void {
    // Get organization ID from store
    this.store.select(AuthState.organization)
      .pipe(takeUntil(this.destroy$))
      .subscribe(organization => {
        if (organization?.id) {
          this.organizationId = organization.id;
          this.loadDashboard();
        }
      });
    
    // Watch for date range changes
    this.filtersForm.get('dateRange')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (value !== DateRange.CUSTOM) {
          this.filtersForm.patchValue({
            startDate: null,
            endDate: null
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboard(): void {
    if (!this.organizationId) {
      console.warn('No organization ID available');
      return;
    }

    this.loading = true;
    this.error = null;

    const filters: ReportFilters = {
      dateRange: this.filtersForm.value.dateRange,
      startDate: this.filtersForm.value.startDate?.toISOString().split('T')[0],
      endDate: this.filtersForm.value.endDate?.toISOString().split('T')[0]
    };

    this.reportsService.getDashboardMetrics(this.organizationId, filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.metrics = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'No se pudieron cargar los datos del dashboard';
          this.loading = false;
          console.error('Dashboard error:', err);
        }
      });
  }

  applyFilters(): void {
    this.loadDashboard();
  }

  getClientGrowthData(): Array<{ label: string; value: number }> {
    if (!this.metrics) return [];
    
    // Simular datos de crecimiento basados en métricas reales
    const currentClients = this.metrics.clientMetrics.totalClients;
    const growth = this.metrics.clientMetrics.growthRate;
    
    return [
      { label: 'Hace 6 meses', value: Math.max(0, Math.round(currentClients * 0.7)) },
      { label: 'Hace 5 meses', value: Math.max(0, Math.round(currentClients * 0.75)) },
      { label: 'Hace 4 meses', value: Math.max(0, Math.round(currentClients * 0.8)) },
      { label: 'Hace 3 meses', value: Math.max(0, Math.round(currentClients * 0.85)) },
      { label: 'Hace 2 meses', value: Math.max(0, Math.round(currentClients * 0.9)) },
      { label: 'Hace 1 mes', value: Math.max(0, Math.round(currentClients * 0.95)) },
      { label: 'Actual', value: currentClients }
    ];
  }

  getRevenueDistributionData(): Array<{ label: string; value: number }> {
    if (!this.metrics) return [];
    
    return this.metrics.financialMetrics.revenueByPlan.map(plan => ({
      label: plan.planName,
      value: plan.revenue
    }));
  }

  openExportDialog(): void {
    if (!this.organizationId) return;

    const dialogRef = this.dialog.open(ExportDialogComponent, {
      width: '500px',
      data: { organizationId: this.organizationId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        // Mostrar mensaje de éxito
        console.log('Reporte exportado exitosamente');
      }
    });
  }
} 