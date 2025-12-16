import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

interface ValueSelect {
    value: string;
    viewValue: string;
}

@Component({
    selector: 'app-notification-filter-select',
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    template: `
    <div class="mt-4">
      <mat-form-field appearance="outline">
        <mat-label>{{ placeholder }}</mat-label>
        <mat-select [formControl]="control">
          @for (filter of filters; track filter) {
            <mat-option [value]="filter.value">{{ filter.viewValue }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </div>
  `,
})
export class NotificationFilterSelectComponent {
    @Input() control!: FormControl;
    @Input() placeholder: string = 'Filtrar por estado';

    filters: ValueSelect[] = [
        { value: 'all', viewValue: 'Todas' },
        { value: 'pending', viewValue: 'Pendientes' },
        { value: 'completed', viewValue: 'Completadas' },
    ];
}
