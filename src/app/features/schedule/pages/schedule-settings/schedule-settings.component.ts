import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { DaySettingsComponent } from '../../components/day-settings/day-settings.component';

@Component({
  selector: 'app-schedule-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    DaySettingsComponent
  ],
  template: `
    <div class="settings-page min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 pt-8 pb-6 px-4">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
          <div class="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <i class="ph-gear text-white" style="font-size: 32px;"></i>
              </div>
              <div>
                <h1 class="text-3xl font-bold mb-2">Configuración de Horarios</h1>
                <p class="text-blue-100">Gestiona la disponibilidad y configuración del sistema de agendamiento</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings Content -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <mat-tab-group 
            class="settings-tabs"
            backgroundColor="primary"
            color="accent"
          >
            <mat-tab>
              <ng-template mat-tab-label>
                <div class="flex items-center gap-2">
                  <i class="ph-calendar" style="font-size: 20px;"></i>
                  <span>Días de la Semana</span>
                </div>
              </ng-template>
              <div class="p-6">
                <app-day-settings></app-day-settings>
              </div>
            </mat-tab>

            <mat-tab>
              <ng-template mat-tab-label>
                <div class="flex items-center gap-2">
                  <i class="ph-clock" style="font-size: 20px;"></i>
                  <span>Horarios</span>
                </div>
              </ng-template>
              <div class="p-6">
                <div class="text-center py-12">
                  <i class="ph-hammer text-gray-400 text-6xl mb-4"></i>
                  <h3 class="text-xl font-semibold text-gray-600 mb-2">Próximamente</h3>
                  <p class="text-gray-500">Configuración avanzada de horarios estará disponible pronto</p>
                </div>
              </div>
            </mat-tab>

            <mat-tab>
              <ng-template mat-tab-label>
                <div class="flex items-center gap-2">
                  <i class="ph-bell" style="font-size: 20px;"></i>
                  <span>Notificaciones</span>
                </div>
              </ng-template>
              <div class="p-6">
                <div class="text-center py-12">
                  <i class="ph-hammer text-gray-400 text-6xl mb-4"></i>
                  <h3 class="text-xl font-semibold text-gray-600 mb-2">Próximamente</h3>
                  <p class="text-gray-500">Configuración de notificaciones estará disponible pronto</p>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page {
      min-height: 100vh;
    }

    ::ng-deep .settings-tabs .mat-mdc-tab-header {
      border-bottom: 1px solid #e5e7eb;
    }

    ::ng-deep .settings-tabs .mat-mdc-tab {
      min-width: 160px;
    }

    ::ng-deep .settings-tabs .mat-mdc-tab-label {
      padding: 12px 24px;
      font-weight: 500;
    }

    ::ng-deep .settings-tabs .mat-mdc-tab-body-content {
      padding: 0;
    }
  `]
})
export class ScheduleSettingsComponent {}
