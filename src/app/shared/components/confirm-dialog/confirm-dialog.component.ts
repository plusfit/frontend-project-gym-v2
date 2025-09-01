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
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
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
}
