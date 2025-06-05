import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardMetrics } from '../../interfaces/reports.interface';

@Component({
  selector: 'app-dashboard-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Clientes -->
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-600 text-sm font-medium uppercase tracking-wide">Total Clientes</p>
            <p class="text-3xl font-bold text-blue-800 mt-2">{{ metrics?.clientMetrics?.totalClients || 0 }}</p>
            <div class="flex items-center mt-2">
              <i class="ph-trend-up text-green-500 text-sm mr-1"></i>
              <span class="text-green-600 text-sm font-medium">
                +{{ metrics?.clientMetrics?.newClientsThisPeriod || 0 }} este período
              </span>
            </div>
          </div>
          <div class="bg-blue-500 rounded-full p-3">
            <i class="ph-users text-white text-2xl"></i>
          </div>
        </div>
      </div>

      <!-- Ingresos Mensuales -->
      <div class="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-green-600 text-sm font-medium uppercase tracking-wide">Ingresos MRR</p>
            <p class="text-3xl font-bold text-green-800 mt-2">
              {{ formatCurrency(metrics?.financialMetrics?.monthlyRecurringRevenue || 0) }}
            </p>
            <div class="flex items-center mt-2">
              <i class="ph-trend-up text-green-500 text-sm mr-1"></i>
              <span class="text-green-600 text-sm font-medium">
                {{ metrics?.financialMetrics?.revenueGrowth || 0 }}% crecimiento
              </span>
            </div>
          </div>
          <div class="bg-green-500 rounded-full p-3">
            <i class="ph-currency-dollar text-white text-2xl"></i>
          </div>
        </div>
      </div>

      <!-- Ocupación Promedio -->
      <div class="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-orange-600 text-sm font-medium uppercase tracking-wide">Ocupación Promedio</p>
            <p class="text-3xl font-bold text-orange-800 mt-2">
              {{ formatPercentage(metrics?.occupancyMetrics?.averageOccupancy || 0) }}
            </p>
            <div class="flex items-center mt-2">
              <i class="ph-calendar text-orange-500 text-sm mr-1"></i>
              <span class="text-orange-600 text-sm font-medium">
                Capacidad utilizada
              </span>
            </div>
          </div>
          <div class="bg-orange-500 rounded-full p-3">
            <i class="ph-chart-bar text-white text-2xl"></i>
          </div>
        </div>
      </div>

      <!-- Score de Organización -->
      <div class="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-purple-600 text-sm font-medium uppercase tracking-wide">Score Organización</p>
            <p class="text-3xl font-bold text-purple-800 mt-2">
              {{ metrics?.organizationMetrics?.performanceScore || 0 }}/100
            </p>
            <div class="flex items-center mt-2">
              <i class="ph-trophy text-purple-500 text-sm mr-1"></i>
              <span class="text-purple-600 text-sm font-medium">
                {{ getPerformanceLabel(metrics?.organizationMetrics?.performanceScore || 0) }}
              </span>
            </div>
          </div>
          <div class="bg-purple-500 rounded-full p-3">
            <i class="ph-star text-white text-2xl"></i>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard-cards.component.css']
})
export class DashboardCardsComponent {
  @Input() metrics: DashboardMetrics | null = null;

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatPercentage(value: number): string {
    return `${Math.round(value)}%`;
  }

  getPerformanceLabel(score: number): string {
    if (score >= 90) return 'Excelente';
    if (score >= 80) return 'Muy Bueno';
    if (score >= 70) return 'Bueno';
    if (score >= 60) return 'Regular';
    return 'Necesita Mejoras';
  }
} 