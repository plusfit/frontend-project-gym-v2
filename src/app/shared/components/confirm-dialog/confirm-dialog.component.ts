import { NgClass, NgIf } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  inject,
  output,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { BtnDirective } from "@shared/directives/btn/btn.directive";

export enum DialogType {
  DELETE_PLAN = "DELETE_PLAN",
  DELETE_EXERCISE = "DELETE_EXERCISE",
  DELETE_ROUTINE = "DELETE_ROUTINE",
  DELETE_SUBROUTINE = "DELETE_SUBROUTINE",
  DELETE_CLIENT = "DELETE_CLIENT",
  DELETE_REWARD = "DELETE_REWARD",
  ENABLE_CLIENT = "ENABLE_CLIENT",
  DISABLE_CLIENT = "DISABLE_CLIENT",
  CONFIRM_CHANGE = "CONFIRM_CHANGE",
  GENERAL = "GENERAL",
}

interface DialogConfig {
  icon: string;
  color: string;
  confirmText: string;
}

const DIALOG_CONFIGS: Record<DialogType, DialogConfig> = {
  [DialogType.DELETE_PLAN]: {
    icon: "ph-file-text",
    color: "bg-red-600 hover:bg-red-700",
    confirmText: "Eliminar",
  },
  [DialogType.DELETE_EXERCISE]: {
    icon: "ph-barbell",
    color: "bg-red-600 hover:bg-red-700",
    confirmText: "Eliminar",
  },
  [DialogType.DELETE_ROUTINE]: {
    icon: "ph-list-bullets",
    color: "bg-red-600 hover:bg-red-700",
    confirmText: "Eliminar",
  },
  [DialogType.DELETE_SUBROUTINE]: {
    icon: "ph-list-dashes",
    color: "bg-red-600 hover:bg-red-700",
    confirmText: "Eliminar",
  },
  [DialogType.DELETE_CLIENT]: {
    icon: "ph-user",
    color: "bg-red-600 hover:bg-red-700",
    confirmText: "Eliminar",
  },
  [DialogType.DELETE_REWARD]: {
    icon: "ph-gift",
    color: "bg-red-600 hover:bg-red-700",
    confirmText: "Eliminar",
  },
  [DialogType.ENABLE_CLIENT]: {
    icon: "ph-user-plus",
    color: "bg-green-600 hover:bg-green-700",
    confirmText: "Habilitar",
  },
  [DialogType.DISABLE_CLIENT]: {
    icon: "ph-user-minus",
    color: "bg-orange-600 hover:bg-orange-700",
    confirmText: "Deshabilitar",
  },
  [DialogType.CONFIRM_CHANGE]: {
    icon: "ph-arrows-left-right",
    color: "bg-blue-600 hover:bg-blue-700",
    confirmText: "Confirmar",
  },
  [DialogType.GENERAL]: {
    icon: "ph-question",
    color: "bg-blue-600 hover:bg-blue-700",
    confirmText: "Aceptar",
  },
};

/**
 * @title Dialog Animations
 */
@Component({
  selector: "app-confirm-dialog",
  templateUrl: "./confirm-dialog.component.html",
  styleUrl: "./confirm-dialog.component.css",
  standalone: true,
  imports: [
    NgClass,
    NgIf,
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
    public data: {
      title: string;
      contentMessage: string;
      type?: DialogType;
      icon?: string;
      iconColor?: string;
      confirmButtonText?: string;
    },
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

  getDefaultIcon(): string {
    // Si se proporciona un icono específico, usarlo
    if (this.data.icon) {
      return this.data.icon;
    }

    // Si se especifica un tipo, usar la configuración correspondiente
    if (this.data.type && DIALOG_CONFIGS[this.data.type]) {
      return DIALOG_CONFIGS[this.data.type].icon;
    }

    // Fallback por defecto
    return DIALOG_CONFIGS[DialogType.GENERAL].icon;
  }

  getIconBackgroundClass(): string {
    // Si se proporciona un iconColor personalizado, usarlo (para compatibilidad hacia atrás)
    if (this.data.iconColor) {
      // Manejar clases de Tailwind directamente
      if (this.data.iconColor.includes("bg-")) {
        // Si ya es una clase de fondo de Tailwind, convertir a color sólido
        if (this.data.iconColor.includes("indigo")) {
          return "bg-indigo-600 hover:bg-indigo-700";
        }
        if (this.data.iconColor.includes("red")) {
          return "bg-red-600 hover:bg-red-700";
        }
        if (this.data.iconColor.includes("blue")) {
          return "bg-blue-600 hover:bg-blue-700";
        }
        if (this.data.iconColor.includes("green")) {
          return "bg-green-600 hover:bg-green-700";
        }
        if (
          this.data.iconColor.includes("yellow") ||
          this.data.iconColor.includes("orange")
        ) {
          return "bg-orange-600 hover:bg-orange-700";
        }
      }

      // Manejar colores por nombre
      if (this.data.iconColor.includes("blue")) {
        return "bg-blue-600 hover:bg-blue-700";
      }
      if (this.data.iconColor.includes("green")) {
        return "bg-green-600 hover:bg-green-700";
      }
      if (
        this.data.iconColor.includes("yellow") ||
        this.data.iconColor.includes("warning")
      ) {
        return "bg-orange-600 hover:bg-orange-700";
      }
      if (this.data.iconColor.includes("red")) {
        return "bg-red-600 hover:bg-red-700";
      }
    }

    // Si se especifica un tipo, usar la configuración correspondiente
    if (this.data.type && DIALOG_CONFIGS[this.data.type]) {
      return DIALOG_CONFIGS[this.data.type].color;
    }

    // Fallback por defecto
    return DIALOG_CONFIGS[DialogType.GENERAL].color;
  }

  getConfirmButtonClass(): string {
    // Usar la misma lógica de colores que el icono para consistencia
    return this.getIconBackgroundClass();
  }

  getConfirmButtonText(): string {
    // Si se proporciona un texto específico, usarlo
    if (this.data.confirmButtonText) {
      return this.data.confirmButtonText;
    }

    // Si se especifica un tipo, usar la configuración correspondiente
    if (this.data.type && DIALOG_CONFIGS[this.data.type]) {
      return DIALOG_CONFIGS[this.data.type].confirmText;
    }

    // Fallback por defecto
    return DIALOG_CONFIGS[DialogType.GENERAL].confirmText;
  }
}
