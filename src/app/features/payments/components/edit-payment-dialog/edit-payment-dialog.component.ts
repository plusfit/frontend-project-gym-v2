import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { PaymentItem } from '../../interfaces/payments.interface';

@Component({
    selector: 'app-edit-payment-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule
    ],
    templateUrl: './edit-payment-dialog.component.html',
    styleUrls: ['./edit-payment-dialog.component.css']
})
export class EditPaymentDialogComponent implements OnInit {
    editForm: FormGroup;

    constructor(
        public dialogRef: MatDialogRef<EditPaymentDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { payment: PaymentItem },
        private fb: FormBuilder
    ) {
        this.editForm = this.fb.group({
            amount: [this.data.payment.amount, [Validators.required, Validators.min(1)]]
        });
    }

    ngOnInit(): void {
        // Componente inicializado
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onSave(): void {
        if (this.editForm.valid) {
            const newAmount = this.editForm.get('amount')?.value;
            this.dialogRef.close(newAmount);
        }
    }

    get isFormValid(): boolean {
        return this.editForm.valid;
    }

    get hasChanges(): boolean {
        const currentAmount = this.editForm.get('amount')?.value;
        return currentAmount !== this.data.payment.amount;
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