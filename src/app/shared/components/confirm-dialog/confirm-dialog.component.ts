import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  inject,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
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
    @Inject(MAT_DIALOG_DATA)
    public data: { title: string; contentMessage: string },
  ) {}

  // contentMessage = input<string>();
  // title = input<string>();
  confirm = output<boolean>();

  handleConfirm() {
    this.confirm.emit(true);
  }
  handleCancel() {
    this.confirm.emit(false);
  }
}
