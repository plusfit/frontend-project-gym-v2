import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
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
  @Output() valueSelected = new EventEmitter<string>();

  onValueChange(event: MatSelectChange): void {
    this.valueSelected.emit(event.value); // emitís el value que seleccionaron
  }

  filters: ValueSelect[] = [
    { value: 'all', viewValue: 'Todos' },
    { value: 'true', viewValue: 'Sin Plan' },
    { value: 'true', viewValue: 'Deshabilitados' },
  ];

  constructor(
    private store: Store,
    private actions: Actions,
  ) {}

  filterChange(event: any): void {
    this.disabled = false;
    this.withoutPlan = false;

    if (event.source.triggerValue === 'Deshabilitados') {
      this.disabled = true;
    } else {
      this.withoutPlan = event.value === 'true';
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
