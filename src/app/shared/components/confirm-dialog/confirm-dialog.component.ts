import { NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    inject,
    output
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { BtnDirective } from '@shared/directives/btn/btn.directive';

/**
 * @title Dialog Animations
 */
@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
  standalone: true,
  imports: [
    NgClass,
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    MatIconModule,
    BtnDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  readonly dialog = inject(MatDialog);
  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { title: string; contentMessage: string; icon?: string; iconColor?: string; confirmButtonText?: string },
  ) {}

  // contentMessage = input<string>();
  // title = input<string>();
  confirm = output<boolean>();

  handleConfirm() {
    this.confirm.emit(true);
    this.dialogRef.close();
  }

  handleCancel() {
    this.confirm.emit(false);
    this.dialogRef.close();
  }

  getIconBackgroundClass(): string {
    // Si se proporciona un iconColor personalizado, usarlo
    if (this.data.iconColor) {
      // Si iconColor contiene 'blue', usar fondo azul
      if (this.data.iconColor.includes('blue')) {
        return 'bg-blue-600 hover:bg-blue-700';
      }
      // Si iconColor contiene 'green', usar fondo verde
      if (this.data.iconColor.includes('green')) {
        return 'bg-green-600 hover:bg-green-700';
      }
      // Si iconColor contiene 'yellow' o 'warning', usar fondo amarillo/naranja
      if (this.data.iconColor.includes('yellow') || this.data.iconColor.includes('warning')) {
        return 'bg-orange-600 hover:bg-orange-700';
      }
      // Si iconColor contiene 'red', usar fondo rojo
      if (this.data.iconColor.includes('red')) {
        return 'bg-red-600 hover:bg-red-700';
      }
    }
    
    // Determinar color basado en el tipo de acción por el icono
    switch (this.data.icon) {
      case 'swap_horiz':
      case 'edit':
      case 'update':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'check':
      case 'check_circle':
        return 'bg-green-600 hover:bg-green-700';
      case 'warning':
      case 'info':
        return 'bg-orange-600 hover:bg-orange-700';
      case 'delete':
      case 'delete_forever':
      case 'cancel':
        return 'bg-red-600 hover:bg-red-700';
      default:
        // Por defecto, usar azul para acciones generales
        return 'bg-blue-600 hover:bg-blue-700';
    }
  }

  getConfirmButtonClass(): string {
    // Si se proporciona un iconColor personalizado, usar el mismo color para consistencia
    if (this.data.iconColor) {
      if (this.data.iconColor.includes('blue')) {
        return 'bg-blue-600 hover:bg-blue-700';
      }
      if (this.data.iconColor.includes('green')) {
        return 'bg-green-600 hover:bg-green-700';
      }
      if (this.data.iconColor.includes('yellow') || this.data.iconColor.includes('warning')) {
        return 'bg-orange-600 hover:bg-orange-700';
      }
      if (this.data.iconColor.includes('red')) {
        return 'bg-red-600 hover:bg-red-700';
      }
    }
    
    // Determinar color basado en el tipo de acción
    switch (this.data.icon) {
      case 'swap_horiz':
      case 'edit':
      case 'update':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'check':
      case 'check_circle':
        return 'bg-green-600 hover:bg-green-700';
      case 'warning':
      case 'info':
        return 'bg-orange-600 hover:bg-orange-700';
      case 'delete':
      case 'delete_forever':
      case 'cancel':
        return 'bg-red-600 hover:bg-red-700';
      default:
        // Para acciones generales, usar azul en lugar de rojo
        return 'bg-blue-600 hover:bg-blue-700';
    }
  }
}
