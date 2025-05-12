import { Component, Input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { GetClients } from '@features/client/state/clients.actions';
import { Actions, Store } from '@ngxs/store';
import { environment } from '../../../../environments/environment';

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
  pageSize = environment.config.pageSize;
  withoutPlan = false;
  disabled = false;

  @Input() control!: FormControl;
  @Input() options!: any[];
  @Input() placeholder!: string;
  @Input() value!: string;

  filters: ValueSelect[] = [
    { value: 'all', viewValue: 'Todos' },
    { value: 'withoutPlan', viewValue: 'Sin Plan' },
    { value: 'disabled', viewValue: 'Deshabilitados' },
  ];

  constructor(
    private store: Store,
    private actions: Actions,
  ) {}

  filterChange(event: any): void {
    this.disabled = false;
    this.withoutPlan = false;

    const selected = event.value;

    if (selected === 'disabled') {
      this.disabled = true;
    } else if (selected === 'withoutPlan') {
      this.withoutPlan = true;
    }

    this.store.dispatch(
      new GetClients({
        page: 1,
        pageSize: this.pageSize,
        withoutPlan: this.withoutPlan,
        disabled: this.disabled,
        role: 'User',
      }),
    );
  }
}
