import { AsyncPipe, CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { GetClients } from '@features/client/state/clients.actions';
import { ClientsState } from '@features/client/state/clients.state';
import { GetPlans } from '@features/plans/state/plan.actions';
import { PlansState } from '@features/plans/state/plan.state';
import { GetRoutinesByPage } from '@features/routines/state/routine.actions';
import { RoutineState } from '@features/routines/state/routine.state';
import { Store } from '@ngxs/store';
import {
  Observable,
  combineLatest,
  map,
  Subscription,
  filter,
  tap,
} from 'rxjs';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

interface DashboardStats {
  totalClients: number;
  totalPlans: number;
  totalRoutines: number;
  clientsWithPlans: number;
  clientsWithoutPlans: number;
  activeClients: number;
}

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterLink, AsyncPipe, CommonModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css',
})
export class WelcomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('clientsChart', { static: false })
  clientsChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('plansChart', { static: false })
  plansChart!: ElementRef<HTMLCanvasElement>;

  stats$!: Observable<DashboardStats>;
  isLoading$!: Observable<boolean>;

  private clientsChartInstance: Chart | null = null;
  private plansChartInstance: Chart | null = null;
  private statsSubscription?: Subscription;
  private chartsCreated = false;

  constructor(private store: Store) {}

  ngOnInit(): void {
    // Cargar datos iniciales
    this.loadDashboardData();

    // Configurar observables
    this.setupObservables();
  }

  ngAfterViewInit(): void {
    // Esperar un poco más para asegurar que los elementos estén disponibles
    setTimeout(() => {
      this.initializeCharts();
    }, 500);
  }

  private loadDashboardData(): void {
    // Cargar todos los datos necesarios
    console.log('Cargando datos del dashboard...');
    this.store.dispatch(new GetClients({ page: 1, pageSize: 1000 }));
    this.store.dispatch(new GetPlans({ page: 1, pageSize: 1000, searchQ: '' }));
    this.store.dispatch(new GetRoutinesByPage({ page: 1 }));
  }

  private setupObservables(): void {
    // Combinar datos de diferentes estados
    this.stats$ = combineLatest([
      this.store.select(ClientsState.getTotal),
      this.store.select(ClientsState.getClients),
      this.store.select(PlansState.getTotal),
      this.store.select(RoutineState.totalRoutines),
    ]).pipe(
      map(([totalClients, clients, totalPlans, totalRoutines]) => {
        const clientsWithPlans = clients.filter(
          (client) => client.planId,
        ).length;
        const clientsWithoutPlans = clients.filter(
          (client) => !client.planId,
        ).length;
        const activeClients = totalClients || 0;

        const stats = {
          totalClients: totalClients || 0,
          totalPlans: totalPlans || 0,
          totalRoutines: totalRoutines || 0,
          clientsWithPlans,
          clientsWithoutPlans,
          activeClients,
        };

        console.log('Stats calculadas:', stats);
        return stats;
      }),
      tap((stats) => {
        // Crear gráficas cuando tengamos datos y los elementos estén listos
        if (this.canvasElementsReady() && !this.chartsCreated) {
          setTimeout(() => this.createCharts(stats), 100);
        }
      }),
    );

    // Estado de carga
    this.isLoading$ = combineLatest([
      this.store.select(ClientsState.isLoading),
      this.store.select(PlansState.isLoading),
      this.store.select(RoutineState.routineLoading),
    ]).pipe(
      map(
        ([clientsLoading, plansLoading, routinesLoading]) =>
          clientsLoading || plansLoading || routinesLoading,
      ),
    );
  }

  private canvasElementsReady(): boolean {
    return !!(
      this.clientsChart?.nativeElement && this.plansChart?.nativeElement
    );
  }

  private initializeCharts(): void {
    console.log('Inicializando gráficas...');
    console.log('Canvas elements ready:', this.canvasElementsReady());

    if (this.canvasElementsReady()) {
      // Suscribirse a stats para crear gráficas cuando tengamos datos
      this.statsSubscription = this.stats$
        .pipe(
          filter(
            (stats) =>
              stats.totalClients > 0 ||
              stats.totalPlans > 0 ||
              stats.totalRoutines > 0,
          ),
        )
        .subscribe((stats) => {
          if (!this.chartsCreated) {
            this.createCharts(stats);
            this.chartsCreated = true;
          } else {
            this.updateCharts(stats);
          }
        });
    } else {
      console.warn('Canvas elements not ready, retrying...');
      setTimeout(() => this.initializeCharts(), 200);
    }
  }

  private createCharts(stats: DashboardStats): void {
    console.log('Creando gráficas con stats:', stats);
    this.createClientsChart(stats);
    this.createPlansChart(stats);
  }

  private updateCharts(stats: DashboardStats): void {
    if (this.clientsChartInstance) {
      this.clientsChartInstance.data.datasets[0].data = [
        stats.clientsWithPlans,
        stats.clientsWithoutPlans,
      ];
      this.clientsChartInstance.update();
    }

    if (this.plansChartInstance) {
      this.plansChartInstance.data.datasets[0].data = [
        stats.totalClients,
        stats.totalPlans,
        stats.totalRoutines,
      ];
      this.plansChartInstance.update();
    }
  }

  private createClientsChart(stats: DashboardStats): void {
    console.log('Creando gráfica de clientes...');

    if (this.clientsChartInstance) {
      this.clientsChartInstance.destroy();
    }

    const ctx = this.clientsChart?.nativeElement?.getContext('2d');
    if (!ctx) {
      console.error('No se pudo obtener el contexto del canvas de clientes');
      return;
    }

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['Con Planes', 'Sin Planes'],
        datasets: [
          {
            data: [stats.clientsWithPlans, stats.clientsWithoutPlans],
            backgroundColor: [
              '#10B981', // green
              '#F59E0B', // amber
            ],
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12,
              },
              color: '#374151',
            },
          },
        },
      },
    };

    try {
      this.clientsChartInstance = new Chart(ctx, config);
      console.log('Gráfica de clientes creada exitosamente');
    } catch (error) {
      console.error('Error creando gráfica de clientes:', error);
    }
  }

  private createPlansChart(stats: DashboardStats): void {
    console.log('Creando gráfica de planes...');

    if (this.plansChartInstance) {
      this.plansChartInstance.destroy();
    }

    const ctx = this.plansChart?.nativeElement?.getContext('2d');
    if (!ctx) {
      console.error('No se pudo obtener el contexto del canvas de planes');
      return;
    }

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: ['Clientes', 'Planes', 'Rutinas'],
        datasets: [
          {
            label: 'Total',
            data: [stats.totalClients, stats.totalPlans, stats.totalRoutines],
            backgroundColor: [
              '#3B82F6', // blue
              '#8B5CF6', // purple
              '#06B6D4', // cyan
            ],
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#F3F4F6',
            },
            ticks: {
              stepSize: 1,
              color: '#6B7280',
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: '#6B7280',
            },
          },
        },
      },
    };

    try {
      this.plansChartInstance = new Chart(ctx, config);
      console.log('Gráfica de planes creada exitosamente');
    } catch (error) {
      console.error('Error creando gráfica de planes:', error);
    }
  }

  getYear(): number {
    return new Date().getFullYear();
  }

  ngOnDestroy(): void {
    // Limpiar gráficas y suscripciones al destruir el componente
    if (this.clientsChartInstance) {
      this.clientsChartInstance.destroy();
    }
    if (this.plansChartInstance) {
      this.plansChartInstance.destroy();
    }
    if (this.statsSubscription) {
      this.statsSubscription.unsubscribe();
    }
  }
}
