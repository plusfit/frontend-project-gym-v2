import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { PaymentItem } from '../../interfaces/payments.interface';

@Component({
    selector: 'app-delete-payment-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule
    ],
    templateUrl: './delete-payment-dialog.component.html',
    styleUrls: ['./delete-payment-dialog.component.css']
})
export class DeletePaymentDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<DeletePaymentDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { payment: PaymentItem }
    ) { }

    onCancel(): void {
        this.dialogRef.close(false);
    }

    onConfirm(): void {
        this.dialogRef.close(true);
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
            day: '2-digit'
        });
    }
}