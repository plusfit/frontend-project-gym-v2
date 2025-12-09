import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../../services/settings.service';
import { SnackBarService } from '@core/services/snackbar.service';

@Component({
  selector: 'app-invitation-code',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-6">
      <div class="flex items-start justify-between mb-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
            <i class="ph-ticket text-white text-2xl"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900">Código de Invitación</h3>
            <p class="text-sm text-gray-500 mt-1">Gestiona el acceso de nuevos clientes a la plataforma</p>
          </div>
        </div>
      </div>

      <div class="relative">
        <div *ngIf="currentCode; else noCode" class="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="flex h-2 w-2 relative">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider !m-0">Código Activo</p>
              </div>
              <div class="flex items-center gap-4">
                <span class="text-4xl font-mono font-bold text-gray-900 tracking-widest">{{ currentCode.code }}</span>
                <button 
                  (click)="copyCode()" 
                  class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  title="Copiar Código">
                  <i class="ph-copy text-xl"></i>
                </button>
              </div>
            </div>
            
            <div class="flex items-center gap-3">
               <div class="h-12 w-px bg-gray-200 hidden md:block"></div>
               <button 
                (click)="generateCode()" 
                [disabled]="isLoading"
                class="px-4 py-2 text-sm text-gray-600 font-medium hover:text-gray-900 transition-colors flex items-center gap-2">
                <i class="ph-arrows-clockwise"></i>
                Regenerar
              </button>
            </div>
          </div>

          <div class="mt-6 pt-6 border-t border-gray-200/60">
            <div class="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
              <div class="flex-1 font-mono text-sm text-gray-600 truncate select-all">
                {{ currentCode.link }}
              </div>
              <button 
                (click)="copyLink()" 
                class="text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                Copiar Link
              </button>
            </div>
            <p class="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
              <i class="ph-info text-blue-500"></i>
              Este código expirará automáticamente cuando sea utilizado por un nuevo usuario.
            </p>
          </div>
        </div>

        <ng-template #noCode>
          <div class="border-2 border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-gray-50 transition-colors group">
            <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
              <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <i class="ph-ticket text-blue-500 text-3xl"></i>
              </div>
            </div>
            
            <h4 class="text-lg font-bold text-gray-900 mb-2">No hay código activo</h4>
            <p class="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
              Genera un nuevo código de invitación para permitir el registro de un cliente.
            </p>
            
            <button 
              (click)="generateCode()" 
              [disabled]="isLoading"
              class="group relative px-8 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="relative flex items-center gap-2">
                <i class="ph-plus-circle text-lg"></i>
                <span>Generar Código</span>
              </div>
            </button>
          </div>
        </ng-template>
      </div>
    </div>
  `
})
export class InvitationCodeComponent implements OnInit {
  currentCode: { code: string; link: string } | null = null;
  isLoading = false;

  constructor(
    private settingsService: SettingsService,
    private snackBarService: SnackBarService
  ) {}

  ngOnInit() {
    this.loadCurrentCode();
  }

  loadCurrentCode() {
    this.settingsService.getCurrentInvitationCode().subscribe({
      next: (res) => {
        this.currentCode = res;
      },
      error: (err) => {
        console.error('Error loading code', err);
      }
    });
  }

  generateCode() {
    this.isLoading = true;
    this.settingsService.generateInvitationCode().subscribe({
      next: (res) => {
        this.currentCode = res;
        this.isLoading = false;
        this.snackBarService.showSuccess('Éxito', 'Código generado correctamente');
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBarService.showError('Error', 'Error al generar código');
        console.error(err);
      }
    });
  }

  copyLink() {
    if (this.currentCode?.link) {
      navigator.clipboard.writeText(this.currentCode.link).then(() => {
        this.snackBarService.showSuccess('Éxito', 'Link copiado al portapapeles');
      });
    }
  }

  copyCode() {
    if (this.currentCode?.code) {
      navigator.clipboard.writeText(this.currentCode.code).then(() => {
        this.snackBarService.showSuccess('Éxito', 'Código copiado al portapapeles');
      });
    }
  }
}
