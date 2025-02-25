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

  @Input() control!: FormControl;
  @Input() options!: any[];
  @Input() placeholder!: string;
  @Input() value!: string;

  filters: ValueSelect[] = [
    { value: 'all', viewValue: 'Todos' },
    { value: 'true', viewValue: 'Sin Plan' },
  ];

  constructor(
    private store: Store,
    private actions: Actions,
  ) {}

  filterChange(value: string): void {
    this.withoutPlan = value === 'true';
    this.store.dispatch(
      new GetClients({
        page: 1,
        pageSize: this.pageSize,
        withoutPlan: this.withoutPlan, // Mandar explícitamente el filtro de "sin plan"
        role: 'User', // Si también quieres filtrar por rol, mantén este parámetro
      }),
    );
  }
}
