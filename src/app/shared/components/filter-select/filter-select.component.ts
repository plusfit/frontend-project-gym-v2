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
  selector: 'app-filter-select',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './filter-select.component.html',
})
export class FilterSelectComponent {
  @Input() control!: FormControl;
  @Input() options!: any[];
  @Input() placeholder!: string;
  @Input() value!: string;

  @Output() filterChange = new EventEmitter<{ withoutPlan: boolean, disabled: boolean, overdue: boolean }>();

  filters: ValueSelect[] = [
    { value: 'all', viewValue: 'Todos' },
    { value: 'withoutPlan', viewValue: 'Sin Plan' },
    { value: 'disabled', viewValue: 'Deshabilitados' },
    { value: 'overdue', viewValue: 'Atrasados' },
  ];

  onFilterChange(event: any): void {
    const selected = event.value;
    let withoutPlan = false;
    let disabled = false;
    let overdue = false;

    if (selected === 'disabled') {
      disabled = true;
    } else if (selected === 'withoutPlan') {
      withoutPlan = true;
    } else if (selected === 'overdue') {
      overdue = true;
    }

    this.filterChange.emit({ withoutPlan, disabled, overdue });
  }
}
