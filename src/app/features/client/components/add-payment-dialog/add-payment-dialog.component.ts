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
import { Store } from "@ngxs/store";
import { GetPlan } from "@features/plans/state/plan.actions";
import { PlansState } from "@features/plans/state/plan.state";
import { Observable } from "rxjs";
import { Plan } from "@features/plans/interfaces/plan.interface";

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
export class AddPaymentDialogComponent implements OnInit {
  readonly dialog = inject(MatDialog);

  paymentOptions: PaymentOption[] = [
    { days: 32, label: "1 mes", selected: false },
    { days: 92, label: "3 meses", selected: false },
    { days: 182, label: "6 meses", selected: false },
  ];

  selectedOption: PaymentOption | null = null;
  selectedPlan$: Observable<Plan | null>;
  planLoading$: Observable<boolean | null>;

  confirm = output<{
    clientName: string;
    clientId: string;
    days: number;
    amount: number;
  } | null>();

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      clientName: string;
      clientId: string;
      planId: string;
    },
    private store: Store
  ) {
    this.selectedPlan$ = this.store.select(PlansState.getSelectedPlan);
    this.planLoading$ = this.store.select(PlansState.isLoading);
  }

  ngOnInit(): void {
    // Si tenemos planId, obtener la información del plan
    if (this.data.planId) {
      this.store.dispatch(new GetPlan(this.data.planId));
    }
  }

  selectOption(option: PaymentOption): void {
    for (const opt of this.paymentOptions) {
      opt.selected = false;
    }

    option.selected = true;
    this.selectedOption = option;
  }

  handleConfirm(): void {
    if (this.selectedOption) {
      // Obtener la información del plan del store
      const selectedPlan = this.store.selectSnapshot(PlansState.getSelectedPlan);

      const monthsSelected = this.getMonthsFromDays(this.selectedOption.days);
      const planPrice = selectedPlan?.price || 0;
      const totalPrice = planPrice * monthsSelected;

      this.confirm.emit({
        clientName: this.data.clientName,
        clientId: this.data.clientId,
        days: this.selectedOption.days,
        amount: totalPrice,
      });
    } else {
      this.confirm.emit(null);
    }
  }

  private getMonthsFromDays(days: number): number {
    if (days === 32) return 1;
    if (days === 92) return 3;
    if (days === 182) return 6;
    return 0;
  }

  handleCancel(): void {
    this.confirm.emit(null);
  }

  get isConfirmDisabled(): boolean {
    return !this.selectedOption;
  }
}
