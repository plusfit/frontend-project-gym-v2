import { AsyncPipe } from '@angular/common';
import { Component, Inject, OnInit, output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { SnackBarService } from '@core/services/snackbar.service';
import {
  AssignClient,
  getClientsAssignable,
  getMaxCount,
} from '@features/schedule/state/schedule.actions';
import { ScheduleState } from '@features/schedule/state/schedule.state';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { BtnDirective } from '@shared/directives/btn/btn.directive';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { FiltersBarComponent } from '../../../../shared/components/filter-bar/filter-bar.component';
import { TableComponent } from '../../../../shared/components/table/table.component';

@Component({
  selector: 'app-add-client-list',
  standalone: true,
  imports: [
    MatListModule,
    FormsModule,
    ReactiveFormsModule,
    BtnDirective,
    TableComponent,
    FiltersBarComponent,
    AsyncPipe,
  ],
  templateUrl: './add-client-list.component.html',
  styleUrl: './add-client-list.component.css',
})
export class AddClientListComponent implements OnInit {
  clientsAssignable$!: Observable<any[]>;
  totalClients$!: Observable<number>;
  filteredClients!: any[]; // Lista filtrada para mostrar
  form: FormGroup;
  searchControl = new FormControl(); // Control de búsqueda
  clientsControl = new FormControl();
  client = output<any>({
    alias: 'client',
  });
  loading$: Observable<boolean> = this.store.select(
    ScheduleState.scheduleLoading,
  );
  pageSize = environment.config.pageSize;
  selectedClients: any[] = [];
  clients!: any[];
  constructor(
    private store: Store,
    private actions: Actions,
    public dialogRef: MatDialogRef<AddClientListComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { id: any; title: string },
    private snackbar: SnackBarService,
  ) {
    this.form = new FormGroup({
      clients: this.clientsControl,
    });
  }

  ngOnInit(): void {
    this.clientsAssignable$ = this.store.select(
      ScheduleState.clientsAssignable,
    );

    this.store.dispatch(new getMaxCount(this.data.id));
    this.store.dispatch(
      new getClientsAssignable({ page: 1, pageSize: this.pageSize }),
    );
  }

  onSearch(filters: { searchQ: string; isActive: boolean }): void {
    this.store.dispatch(
      new getClientsAssignable({
        page: 1,
        pageSize: this.pageSize,
        searchQ: filters.searchQ,
      }),
    );
  }

  toggleClient(element: any): void {
    this.selectedClients = element;
    console.log(this.selectedClients);
  }

  addClient() {
    const clientsSelected = this.selectedClients;
    const idsClients = clientsSelected.map((c: any) => c._id);
    const clients = this.store.selectSnapshot(ScheduleState.clients);
    const maxCount = this.store.selectSnapshot(ScheduleState.maxCount);
    let validClient = true;
    clients.forEach((c: any) => {
      if (c._id === clientsSelected) {
        this.snackbar.showError('El cliente ya ha sido asignado', 'Aceptar');
        validClient = false;
        return;
      }
    });

    if (maxCount && clients.length >= maxCount) {
      this.snackbar.showError('No se pueden asignar más clientes', 'Aceptar');
      validClient = false;
    }

    if (validClient) {
      this.store.dispatch(new AssignClient(this.data.id, idsClients));
      this.actions.pipe(ofActionSuccessful(AssignClient)).subscribe(() => {
        this.snackbar.showSuccess('Cliente asignado correctamente', 'Aceptar');
      });
      const clientsAssignable = this.store.selectSnapshot(
        ScheduleState.clientsAssignable,
      );
      const clientSelected = clientsAssignable.find(
        (c: any) => c._id === clientsSelected,
      );
      this.dialogRef.close(clientSelected);
    }
  }
}
