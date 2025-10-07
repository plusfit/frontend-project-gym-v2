import { ChangeDetectionStrategy, Component, Inject, inject, output, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from "@angular/material/dialog";
import { BtnDirective } from "@shared/directives/btn/btn.directive";
import { CommonModule } from "@angular/common";

interface PaymentOption {
  days: number;
  label: string;
  selected: boolean;
}

@Component({
  selector: "app-add-payment-dialog",
  templateUrl: "./add-payment-dialog.component.html",
  styleUrl: "./add-payment-dialog.component.css",
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    BtnDirective,
    CommonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPaymentDialogComponent {
  readonly dialog = inject(MatDialog);

  paymentOptions: PaymentOption[] = [
    { days: 32, label: "1 mes", selected: false },
    { days: 92, label: "3 meses", selected: false },
    { days: 182, label: "6 meses", selected: false },
  ];

  selectedOption: PaymentOption | null = null;

  confirm = output<{
    clientName: string;
    clientId: string;
    days: number;
  } | null>();

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      clientName: string;
      clientId: string;
    },
  ) { }

  selectOption(option: PaymentOption): void {
    for (const opt of this.paymentOptions) {
      opt.selected = false;
    }

    option.selected = true;
    this.selectedOption = option;
  }

  handleConfirm(): void {
    if (this.selectedOption) {
      this.confirm.emit({
        clientName: this.data.clientName,
        clientId: this.data.clientId,
        days: this.selectedOption.days,
      });
    } else {
      this.confirm.emit(null);
    }
  }

  handleCancel(): void {
    this.confirm.emit(null);
  }

  get isConfirmDisabled(): boolean {
    return !this.selectedOption;
  }
}
