import { AsyncPipe } from '@angular/common';
import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  output,
} from '@angular/core';
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
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { FiltersBarComponent } from '../../../../shared/components/filter-bar/filter-bar.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

interface Client {
  _id: string;
  email: string;
  [key: string]: unknown;
}

@Component({
  selector: 'app-add-client-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatListModule,
    FormsModule,
    ReactiveFormsModule,
    TableComponent,
    FiltersBarComponent,
    AsyncPipe,
    MatPaginator
],
  templateUrl: './add-client-list.component.html',
  styleUrl: './add-client-list.component.css',
})
export class AddClientListComponent implements OnInit, AfterViewChecked {
  clientsAssignable$!: Observable<Client[]>;
  totalClients$!: Observable<number>;
  filteredClients!: Client[];
  form: FormGroup;
  searchControl = new FormControl();
  clientsControl = new FormControl();
  client = output<Client>({
    alias: 'client',
  });
  loadingAssignable$: Observable<boolean> = this.store.select(
    ScheduleState.loadingAssignable,
  );
  pageSize = environment.config.pageSize;
  selectedClients: Client[] = [];
  clients!: Client[];
  title = '';
  clientSelected: Client[] = [];

  constructor(
    private store: Store,
    private actions: Actions,
    public dialogRef: MatDialogRef<AddClientListComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { id: string; clients: Client[]; title: string },
    private snackbar: SnackBarService,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = new FormGroup({
      clients: this.clientsControl,
    });
  }
  ngAfterViewChecked(): void {
    this.cdr.detectChanges();
  }

  cancel(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.title = this.data.title;
    this.clientsAssignable$ = this.store.select(
      ScheduleState.clientsAssignable,
    );
    this.totalClients$ = this.store.select(ScheduleState.getTotal);

    this.store.dispatch(new getMaxCount(this.data.id));
    this.store.dispatch(
      new getClientsAssignable({
        page: 1,
        pageSize: this.pageSize,
        hourId: this.data.id,
      }),
    );
    const selectedClient = this.store.selectSnapshot(
      ScheduleState.selectedClient,
    );
    const clients = this.store.selectSnapshot(ScheduleState.clients);
    this.clientSelected = selectedClient
      ? [...selectedClient, ...clients]
      : [...clients];
  }

  onSearch(filters: { searchQ: string; isActive: boolean }): void {
    this.store.dispatch(
      new getClientsAssignable({
        page: 1,
        pageSize: this.pageSize,
        searchQ: filters.searchQ,
        hourId: this.data.id,
      }),
    );
  }

  loadClients(page: number): void {
    this.store.dispatch(
      new getClientsAssignable({
        page: page,
        pageSize: this.pageSize,
        hourId: this.data.id,
      }),
    );
  }

  paginate(event: PageEvent): void {
    const currentPage = event.pageIndex + 1;
    this.loadClients(currentPage);
  }

  toggleClient(element: Client[]): void {
    this.selectedClients = element;
  }

  addClient() {
    const clients = this.store.selectSnapshot(ScheduleState.clients);
    const clientsSelected = this.selectedClients.filter(
      (client) => !clients.some((cs: Client) => cs._id === client._id),
    );
    const idsClients = clientsSelected.map((c: Client) => c._id);
    const maxCount = this.store.selectSnapshot(ScheduleState.maxCount);
    let validClient = true;

    for (const c of clients) {
      for (const cs of clientsSelected) {
        if (c._id === cs._id) {
          this.snackbar.showError(
            `El cliente ${cs.email} ya se encuentra asignado`,
            'Aceptar',
          );
          validClient = false;
        }
      }
    }

    if (maxCount && clients.length >= maxCount) {
      this.snackbar.showError('Error!', 'No se pueden asignar más clientes');
      validClient = false;
    }

    if (validClient) {
      this.store.dispatch(new AssignClient(this.data.id, idsClients));
      this.actions.pipe(ofActionSuccessful(AssignClient)).subscribe(() => {
        this.snackbar.showSuccess('Éxito!', 'Cliente asignado');
      });
      const clientsAssignable = this.store.selectSnapshot(
        ScheduleState.clientsAssignable,
      );

      this.clientSelected = clientsAssignable.filter((c: Client) =>
        idsClients.includes(c._id),
      );
      this.dialogRef.close(this.clientSelected);
    }
  }
}
