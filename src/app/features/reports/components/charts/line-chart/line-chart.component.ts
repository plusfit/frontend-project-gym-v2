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
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full">
      <canvas #chartCanvas class="w-full h-full"></canvas>
    </div>
  `,
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() data: any[] = [];
  @Input() title = '';
  @Input() xAxisLabel = '';
  @Input() yAxisLabel = '';
  @Input() color = '#3B82F6';
  @Input() backgroundColor = 'rgba(59, 130, 246, 0.1)';

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

    // Configuración del gráfico
    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: this.data.map(item => item.label),
        datasets: [{
          label: this.title,
          data: this.data.map(item => item.value),
          borderColor: this.color,
          backgroundColor: this.backgroundColor,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: this.color,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: this.color,
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: this.color,
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            displayColors: false,
            callbacks: {
              title: (context) => {
                return context[0].label;
              },
              label: (context) => {
                return `${this.yAxisLabel}: ${context.parsed.y.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
                         title: {
               display: !!this.xAxisLabel,
               text: this.xAxisLabel,
               color: '#6B7280',
               font: {
                 size: 12,
                 weight: 'bold'
               }
             },
            grid: {
              display: false
            },
            ticks: {
              color: '#9CA3AF',
              font: {
                size: 11
              }
            }
          },
          y: {
            display: true,
                         title: {
               display: !!this.yAxisLabel,
               text: this.yAxisLabel,
               color: '#6B7280',
               font: {
                 size: 12,
                 weight: 'bold'
               }
             },
            grid: {
              color: 'rgba(229, 231, 235, 0.5)',
              lineWidth: 1
            },
            ticks: {
              color: '#9CA3AF',
              font: {
                size: 11
              },
              callback: function(value) {
                return typeof value === 'number' ? value.toLocaleString() : value;
              }
            },
            beginAtZero: true
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        elements: {
          point: {
            hoverRadius: 8
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  updateChart(newData: any[]): void {
    if (!this.chart) return;

    this.chart.data.labels = newData.map(item => item.label);
    this.chart.data.datasets[0].data = newData.map(item => item.value);
    this.chart.update('active');
  }
} 