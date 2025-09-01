import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface DisableDayDialogData {
  day: string;
  isDisabling: boolean;
  hoursCount: number;
}

@Component({
  selector: 'app-disable-day-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './disable-day-confirm-dialog.component.html',
  styleUrls: ['./disable-day-confirm-dialog.component.css']
})
export class DisableDayConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DisableDayConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DisableDayDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
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
