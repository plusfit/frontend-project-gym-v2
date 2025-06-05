import { 
  Component, 
  Input, 
  OnInit, 
  OnDestroy, 
  ViewChild, 
  ElementRef, 
  AfterViewInit 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-doughnut-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full flex flex-col">
      <div class="flex-1">
        <canvas #chartCanvas class="w-full h-full"></canvas>
      </div>
      @if (showLegend) {
        <div class="mt-4 flex flex-wrap justify-center gap-2">
          @for (item of data; track item.label; let i = $index) {
            <div class="flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-full">
              <div 
                class="w-3 h-3 rounded-full"
                [style.background-color]="colors[i % colors.length]">
              </div>
              <span class="text-sm text-gray-700">{{ item.label }}</span>
              <span class="text-sm font-medium text-gray-900">{{ item.value }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styleUrls: ['./doughnut-chart.component.css']
})
export class DoughnutChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() data: Array<{ label: string; value: number; color?: string }> = [];
  @Input() title = '';
  @Input() showLegend = true;
  @Input() colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
  ];

  private chart?: Chart;

  ngOnInit(): void {
    // Component initialization
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private createChart(): void {
    if (!this.chartCanvas?.nativeElement) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const chartColors = this.data.map((item, index) => 
      item.color || this.colors[index % this.colors.length]
    );

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: this.data.map(item => item.label),
        datasets: [{
          data: this.data.map(item => item.value),
          backgroundColor: chartColors,
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverBorderWidth: 4,
          hoverBackgroundColor: chartColors.map(color => `${color}90`),
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#ffffff',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((sum: number, value) => 
                  sum + (typeof value === 'number' ? value : 0), 0
                );
                const percentage = total > 0 ? ((context.parsed as number / total) * 100).toFixed(1) : '0.0';
                return `${context.label}: ${context.parsed} (${percentage}%)`;
              }
            }
          }
        },
        elements: {
          arc: {
            borderWidth: 3
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        },
        onHover: (event, activeElements) => {
          if (event.native?.target) {
            (event.native.target as HTMLElement).style.cursor = 
              activeElements.length > 0 ? 'pointer' : 'default';
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  updateChart(newData: Array<{ label: string; value: number; color?: string }>): void {
    if (!this.chart) return;

    const chartColors = newData.map((item, index) => 
      item.color || this.colors[index % this.colors.length]
    );

    this.chart.data.labels = newData.map(item => item.label);
    this.chart.data.datasets[0].data = newData.map(item => item.value);
    this.chart.data.datasets[0].backgroundColor = chartColors;
    this.chart.data.datasets[0].hoverBackgroundColor = chartColors.map(color => `${color}90`);
    this.chart.update('active');
  }
} 