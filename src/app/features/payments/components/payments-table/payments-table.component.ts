import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from '@shared/components/table/table.component';

import { PaymentItem, PaymentTableColumn } from '../../interfaces/payments.interface';

@Component({
  selector: 'app-payments-table',
  standalone: true,
  imports: [
    CommonModule,
    TableComponent
  ],
  templateUrl: './payments-table.component.html',
  styleUrls: ['./payments-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentsTableComponent implements OnInit {
  @Input() payments: PaymentItem[] = [];
  @Input() loading = false;

  @Output() editPayment = new EventEmitter<PaymentItem>();
  @Output() deletePayment = new EventEmitter<PaymentItem>();
  @Output() viewClientDetail = new EventEmitter<string>();

  columnKeys: string[] = [
    'clientName',
    'amount',
    'createdAt',
    'acciones'
  ];

  get transformedPayments(): any[] {
    return this.payments;
  }

  ngOnInit() {
    // Component initialization
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU'
    }).format(amount);
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-UY', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onEditPayment(element: any) {
    // app-table pasa el elemento completo, necesitamos extraer el payment original
    const payment = this.payments.find(p => p._id === element._id);
    if (payment) {
      this.editPayment.emit(payment);
    }
  }

  onDeletePayment(element: any) {
    // app-table pasa el elemento completo, necesitamos extraer el payment original
    const payment = this.payments.find(p => p._id === element._id);
    if (payment) {
      this.deletePayment.emit(payment);
    }
  }

  onViewClientDetail(clientId: string) {
    this.viewClientDetail.emit(clientId);
  }
}