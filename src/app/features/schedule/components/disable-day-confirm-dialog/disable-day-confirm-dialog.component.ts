import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

export interface DisableDayDialogData {
  day: string;
  isDisabling: boolean;
  hoursCount: number;
}

export interface DisableDayDialogResult {
  confirmed: boolean;
  reason?: string;
}

@Component({
  selector: 'app-disable-day-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './disable-day-confirm-dialog.component.html',
  styleUrls: ['./disable-day-confirm-dialog.component.css']
})
export class DisableDayConfirmDialogComponent {
  reasonControl = new FormControl('');

  constructor(
    public dialogRef: MatDialogRef<DisableDayConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DisableDayDialogData
  ) {
    console.log('DisableDayConfirmDialog data:', this.data); // Debug log
    
    // Solo cuando estamos deshabilitando, hacer la razón obligatoria
    if (this.data.isDisabling) {
      this.reasonControl.setValidators([Validators.required, Validators.minLength(3)]);
      this.reasonControl.updateValueAndValidity();
    }
  }

  onCancel(): void {
    this.dialogRef.close({ confirmed: false });
  }

  onConfirm(): void {
    // Si estamos deshabilitando y el campo de razón es inválido, marcar como touched y no continuar
    if (this.data.isDisabling && this.reasonControl.invalid) {
      this.reasonControl.markAsTouched();
      return;
    }

    this.dialogRef.close({
      confirmed: true,
      reason: this.data.isDisabling ? this.reasonControl.value : undefined
    });
  }

  get actionText(): string {
    return this.data.isDisabling ? 'deshabilitar' : 'habilitar';
  }

  get iconClass(): string {
    return this.data.isDisabling ? 'ph-x-circle' : 'ph-check-circle';
  }

  get iconColor(): string {
    return this.data.isDisabling ? 'text-red-500' : 'text-green-500';
  }

  get titleText(): string {
    return this.data.isDisabling 
      ? `¿Deshabilitar ${this.data.day}?` 
      : `¿Habilitar ${this.data.day}?`;
  }

  get warningText(): string {
    if (this.data.isDisabling) {
      return this.data.hoursCount > 0 
        ? `Este día tiene ${this.data.hoursCount} horario(s) configurado(s). Los clientes no podrán agendar citas en este día hasta que lo habilites nuevamente.`
        : 'Los clientes no podrán agendar citas en este día hasta que lo habilites nuevamente.';
    } else {
      return 'Los clientes podrán volver a agendar citas en este día.';
    }
  }

  get buttonColor(): string {
    return this.data.isDisabling ? 'warn' : 'primary';
  }

  get buttonText(): string {
    return this.data.isDisabling ? 'Sí, deshabilitar' : 'Sí, habilitar';
  }
}
