import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';

import { PaymentItem, PaymentTableColumn } from '../../interfaces/payments.interface';

@Component({
  selector: 'app-payments-table',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './payments-table.component.html',
  styleUrls: ['./payments-table.component.css']
})
export class PaymentsTableComponent implements OnInit {
  @Input() payments: PaymentItem[] = [];
  @Input() loading = false;
  @Input() totalCount = 0;
  @Input() pageSize = 8;
  @Input() currentPage = 0;

  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() sortChange = new EventEmitter<Sort>();
  @Output() exportData = new EventEmitter<'csv' | 'excel'>();
  @Output() editPayment = new EventEmitter<PaymentItem>();
  @Output() deletePayment = new EventEmitter<PaymentItem>();
  @Output() viewClientDetail = new EventEmitter<string>();

  displayedColumns: PaymentTableColumn[] = [
    { key: 'clientName', label: 'Cliente', sortable: true, type: 'text' },
    { key: 'amount', label: 'Monto', sortable: true, type: 'currency' },
    { key: 'createdAt', label: 'Fecha de Pago', sortable: true, type: 'date' },
    { key: 'actions', label: 'Acciones', sortable: false, type: 'text' }
  ];

  get columnKeys(): string[] {
    return this.displayedColumns.map(col => col.key);
  }

  ngOnInit() {
    // Component initialization
  }

  onPageChange(event: PageEvent) {
    this.pageChange.emit(event);
  }

  onSortChange(event: Sort) {
    this.sortChange.emit(event);
  }

  onExport(format: 'csv' | 'excel') {
    this.exportData.emit(format);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-UY', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  trackByPaymentId(index: number, payment: PaymentItem): string {
    return payment._id;
  }

  onEditPayment(payment: PaymentItem) {
    this.editPayment.emit(payment);
  }

  onDeletePayment(payment: PaymentItem) {
    this.deletePayment.emit(payment);
  }

  onViewClientDetail(payment: PaymentItem) {
    this.viewClientDetail.emit(payment.clientId);
  }
}