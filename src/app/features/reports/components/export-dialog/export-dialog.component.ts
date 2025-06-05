import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ReportsService } from '../../services/reports.service';
import { ReportType, DateRange, ReportFilters } from '../../interfaces/reports.interface';

@Component({
  selector: 'app-export-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="p-6">
      <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <i class="ph-download text-blue-500 mr-2"></i>
        Exportar Reporte
      </h2>

      <form [formGroup]="exportForm" class="space-y-4">
        
        <!-- Tipo de Reporte -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Reporte</label>
          <mat-select formControlName="type" class="w-full">
            @for (option of reportTypeOptions; track option.value) {
              <mat-option [value]="option.value">
                <div class="flex items-center">
                  <i [class]="'ph-' + option.icon + ' mr-2'"></i>
                  {{ option.label }}
                </div>
              </mat-option>
            }
          </mat-select>
        </div>

        <!-- Período -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Período</label>
          <mat-select formControlName="dateRange" class="w-full">
            @for (option of dateRangeOptions; track option.value) {
              <mat-option [value]="option.value">{{ option.label }}</mat-option>
            }
          </mat-select>
        </div>

        <!-- Fechas Personalizadas -->
        @if (exportForm.get('dateRange')?.value === 'custom') {
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
              <input matInput [matDatepicker]="startPicker" formControlName="startDate"
                     class="w-full p-3 border border-gray-300 rounded-lg">
              <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
              <input matInput [matDatepicker]="endPicker" formControlName="endDate"
                     class="w-full p-3 border border-gray-300 rounded-lg">
              <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </div>
          </div>
        }

      </form>

      <!-- Acciones -->
      <div class="flex justify-end space-x-3 mt-8">
        <button mat-button (click)="onCancel()" [disabled]="exporting"
                class="px-4 py-2 text-gray-600 hover:text-gray-800">
          Cancelar
        </button>
        <button mat-raised-button color="primary" 
                (click)="onExport()" 
                [disabled]="exportForm.invalid || exporting"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          @if (exporting) {
            <mat-spinner diameter="20" class="mr-2"></mat-spinner>
          } @else {
            <i class="ph-download mr-2"></i>
          }
          {{ exporting ? 'Exportando...' : 'Exportar' }}
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./export-dialog.component.css']
})
export class ExportDialogComponent {
  exportForm: FormGroup;
  exporting = false;
  
  reportTypeOptions = this.reportsService.getReportTypeOptions();
  dateRangeOptions = this.reportsService.getDateRangeOptions();

  constructor(
    private fb: FormBuilder,
    private reportsService: ReportsService,
    private dialogRef: MatDialogRef<ExportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { organizationId: string }
  ) {
    this.exportForm = this.fb.group({
      type: [ReportType.CLIENTS, Validators.required],
      dateRange: [DateRange.LAST_30_DAYS, Validators.required],
      startDate: [null],
      endDate: [null]
    });

    // Validar fechas cuando es personalizado
    this.exportForm.get('dateRange')?.valueChanges.subscribe(value => {
      const startDateControl = this.exportForm.get('startDate');
      const endDateControl = this.exportForm.get('endDate');
      
      if (value === DateRange.CUSTOM) {
        startDateControl?.setValidators([Validators.required]);
        endDateControl?.setValidators([Validators.required]);
      } else {
        startDateControl?.clearValidators();
        endDateControl?.clearValidators();
        startDateControl?.setValue(null);
        endDateControl?.setValue(null);
      }
      
      startDateControl?.updateValueAndValidity();
      endDateControl?.updateValueAndValidity();
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onExport(): void {
    if (this.exportForm.invalid) return;

    this.exporting = true;
    
    const formValue = this.exportForm.value;
    const filters: ReportFilters = {
      dateRange: formValue.dateRange,
      startDate: formValue.startDate?.toISOString().split('T')[0],
      endDate: formValue.endDate?.toISOString().split('T')[0]
    };

    this.reportsService.exportReport(this.data.organizationId, formValue.type, filters)
      .subscribe({
        next: (blob) => {
          // Crear y descargar archivo
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          
          const fileName = this.generateFileName(formValue.type, formValue.dateRange);
          link.download = fileName;
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          this.exporting = false;
          this.dialogRef.close({ success: true });
        },
        error: (error) => {
          console.error('Error exporting report:', error);
          this.exporting = false;
          // Aquí podrías mostrar un snackbar de error
        }
      });
  }

  private generateFileName(type: ReportType, dateRange: DateRange): string {
    const typeLabels = {
      [ReportType.CLIENTS]: 'clientes',
      [ReportType.FINANCIAL]: 'financiero',
      [ReportType.OCCUPANCY]: 'ocupacion',
      [ReportType.ROUTINES]: 'rutinas',
      [ReportType.PERFORMANCE]: 'rendimiento'
    };

    const dateLabel = dateRange.replace('_', '-');
    const timestamp = new Date().toISOString().split('T')[0];
    
    return `reporte-${typeLabels[type]}-${dateLabel}-${timestamp}.xlsx`;
  }
} 