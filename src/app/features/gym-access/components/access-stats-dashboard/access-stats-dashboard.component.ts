import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

import { LoaderComponent } from '@shared/components/loader/loader.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { EColorBadge } from '@shared/enums/badge-color.enum';

import {
  GymAccessStats,
  StatCard,
  ChartData,
  StatsPeriod
} from '../../interfaces/gym-access-admin.interface';

@Component({
  selector: 'app-access-stats-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    LoaderComponent,
    BadgeComponent
  ],
  templateUrl: './access-stats-dashboard.component.html',
  styleUrls: ['./access-stats-dashboard.component.css']
})
export class AccessStatsDashboardComponent implements OnInit, OnChanges {
  @Input() stats: GymAccessStats | null = null;
  @Input() loading = false;
  @Input() period: StatsPeriod = {
    startDate: '',
    endDate: '',
    period: 'daily'
  };

  // Component state
  statCards: StatCard[] = [];
  chartData: { [key: string]: ChartData } = {};
  
  // Badge colors
  EColorBadge = EColorBadge;

  // Period options
  periodOptions = [
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' }
  ];

  ngOnInit(): void {
    this.updateDashboard();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stats'] && this.stats) {
      this.updateDashboard();
    }
  }

  private updateDashboard(): void {
    if (this.stats) {
      this.generateStatCards();
      this.generateChartData();
    }
  }

  private generateStatCards(): void {
    if (!this.stats) return;

    this.statCards = [
      {
        title: 'Accesos Hoy',
        value: this.stats.overview.totalAccessesToday,
        icon: 'login',
        color: 'primary'
      },
      {
        title: 'Clientes Únicos Hoy',
        value: this.stats.overview.uniqueClientsToday,
        icon: 'people',
        color: 'success'
      },
      {
        title: 'Tasa de Éxito',
        value: `${this.stats.overview.averageSuccessRate.toFixed(1)}%`,
        icon: 'check_circle',
        color: this.stats.overview.averageSuccessRate >= 90 ? 'success' : 'warning'
      },
      {
        title: 'Hora Pico',
        value: this.formatHour(this.stats.overview.peakHour),
        icon: 'schedule',
        color: 'info'
      },
      {
        title: 'Accesos Esta Semana',
        value: this.stats.overview.totalAccessesThisWeek,
        icon: 'calendar_view_week',
        color: 'primary'
      },
      {
        title: 'Accesos Este Mes',
        value: this.stats.overview.totalAccessesThisMonth,
        icon: 'calendar_month',
        color: 'primary'
      },
      {
        title: 'Recompensas Otorgadas',
        value: this.stats.rewardStats.totalRewardsEarned,
        icon: 'emoji_events',
        color: 'warning'
      },
      {
        title: 'Clientes Únicos (Mes)',
        value: this.stats.overview.uniqueClientsThisMonth,
        icon: 'person_add',
        color: 'success'
      }
    ];
  }

  private generateChartData(): void {
    if (!this.stats) return;

    // Daily access chart
    this.chartData['dailyAccesses'] = {
      labels: this.stats.dailyStats.map((stat: any) => this.formatDate(stat.date)),
      datasets: [
        {
          label: 'Accesos Exitosos',
          data: this.stats.dailyStats.map((stat: any) => stat.successfulAccesses),
          backgroundColor: '#10b981',
          borderColor: '#059669',
          tension: 0.4
        },
        {
          label: 'Accesos Fallidos',
          data: this.stats.dailyStats.map((stat: any) => stat.failedAccesses),
          backgroundColor: '#ef4444',
          borderColor: '#dc2626',
          tension: 0.4
        }
      ]
    };

    // Popular times chart
    this.chartData['popularTimes'] = {
      labels: this.stats.popularTimes.map((time: any) => this.formatHour(time.hour)),
      datasets: [
        {
          label: 'Accesos por Hora',
          data: this.stats.popularTimes.map((time: any) => time.accessCount),
          backgroundColor: '#3b82f6',
          borderColor: '#2563eb'
        }
      ]
    };

    // Weekly stats chart (if available)
    if (this.stats.weeklyStats.length > 0) {
      this.chartData['weeklyStats'] = {
        labels: this.stats.weeklyStats.map((stat: any) => stat.week),
        datasets: [
          {
            label: 'Accesos Semanales',
            data: this.stats.weeklyStats.map((stat: any) => stat.totalAccesses),
            backgroundColor: '#8b5cf6',
            borderColor: '#7c3aed'
          }
        ]
      };
    }

    // Monthly stats chart (if available)
    if (this.stats.monthlyStats.length > 0) {
      this.chartData['monthlyStats'] = {
        labels: this.stats.monthlyStats.map((stat: any) => stat.month),
        datasets: [
          {
            label: 'Accesos Mensuales',
            data: this.stats.monthlyStats.map((stat: any) => stat.totalAccesses),
            backgroundColor: '#f59e0b',
            borderColor: '#d97706'
          }
        ]
      };
    }
  }

  /**
   * Get icon for stat card based on type
   */
  getStatCardIcon(color: string): string {
    const iconMap: { [key: string]: string } = {
      'primary': 'analytics',
      'success': 'trending_up',
      'warning': 'warning',
      'danger': 'error',
      'info': 'info'
    };
    return iconMap[color] || 'analytics';
  }

  /**
   * Get color class for stat card
   */
  getStatCardColorClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      'primary': 'text-blue-600 bg-blue-100',
      'success': 'text-green-600 bg-green-100',
      'warning': 'text-yellow-600 bg-yellow-100',
      'danger': 'text-red-600 bg-red-100',
      'info': 'text-indigo-600 bg-indigo-100'
    };
    return colorMap[color] || 'text-gray-600 bg-gray-100';
  }

  /**
   * Get background color for stat value
   */
  getStatValueBgColor(color: string): string {
    const bgMap: { [key: string]: string } = {
      'primary': 'bg-blue-50',
      'success': 'bg-green-50',
      'warning': 'bg-yellow-50',
      'danger': 'bg-red-50',
      'info': 'bg-indigo-50'
    };
    return bgMap[color] || 'bg-gray-50';
  }

  /**
   * Format hour for display
   */
  formatHour(hour: number): string {
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-UY', {
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Get badge color for consecutive days
   */
  getConsecutiveDaysBadgeColor(days: number): EColorBadge {
    if (days >= 30) return EColorBadge.SUCCESS;
    if (days >= 14) return EColorBadge.INFO;
    if (days >= 7) return EColorBadge.WARNING;
    return EColorBadge.NEUTRAL;
  }

  /**
   * Get reward type display text
   */
  getRewardTypeText(type: string): string {
    const typeMap: { [key: string]: string } = {
      'consecutive': 'Días Consecutivos',
      'milestone': 'Hito de Accesos',
      'monthly': 'Meta Mensual',
      'special': 'Evento Especial'
    };
    return typeMap[type] || type;
  }

  /**
   * Format percentage
   */
  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  /**
   * Format large numbers
   */
  formatNumber(value: number): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  }

  /**
   * Get success rate color
   */
  getSuccessRateColor(rate: number): string {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  }

  /**
   * Get success rate icon
   */
  getSuccessRateIcon(rate: number): string {
    if (rate >= 95) return 'trending_up';
    if (rate >= 85) return 'trending_flat';
    return 'trending_down';
  }

  /**
   * Check if chart data exists
   */
  hasChartData(chartType: string): boolean {
    return this.chartData[chartType] && this.chartData[chartType].datasets.length > 0;
  }

  /**
   * Get chart container classes
   */
  getChartContainerClasses(): string {
    return 'bg-white rounded-lg border border-gray-200 p-6';
  }

  /**
   * Get empty state message
   */
  getEmptyStateMessage(): string {
    return 'No hay datos estadísticos disponibles para el período seleccionado.';
  }

  /**
   * Check if stats have data
   */
  hasStatsData(): boolean {
    return !!(this.stats && (
      this.stats.dailyStats.length > 0 ||
      this.stats.weeklyStats.length > 0 ||
      this.stats.monthlyStats.length > 0 ||
      this.stats.topClients.length > 0
    ));
  }
}