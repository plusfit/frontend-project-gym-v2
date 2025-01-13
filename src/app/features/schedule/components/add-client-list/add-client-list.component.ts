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
import { BtnDirective } from '@shared/directives/btn/btn.directive';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { FiltersBarComponent } from '../../../../shared/components/filter-bar/filter-bar.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { TitleComponent } from '../../../../shared/components/title/title.component';

@Component({
  selector: 'app-add-client-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatListModule,
    FormsModule,
    ReactiveFormsModule,
    BtnDirective,
    TableComponent,
    FiltersBarComponent,
    AsyncPipe,
    MatPaginator,
    TitleComponent,
  ],
  templateUrl: './add-client-list.component.html',
  styleUrl: './add-client-list.component.css',
})
export class AddClientListComponent implements OnInit, AfterViewChecked {
  clientsAssignable$!: Observable<any[]>;
  totalClients$!: Observable<number>;
  filteredClients!: any[]; // Lista filtrada para mostrar
  form: FormGroup;
  searchControl = new FormControl(); // Control de búsqueda
  clientsControl = new FormControl();
  client = output<any>({
    alias: 'client',
  });
  loadingAssignable$: Observable<boolean> = this.store.select(
    ScheduleState.loadingAssignable,
  );
  pageSize = environment.config.pageSize;
  selectedClients: any[] = [];
  clients!: any[];
  title = '';
  constructor(
    private store: Store,
    private actions: Actions,
    public dialogRef: MatDialogRef<AddClientListComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { id: any; title: string },
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

  loadClients(page: number): void {
    this.store.dispatch(
      new getClientsAssignable({ page: page, pageSize: this.pageSize }),
    );
  }

  paginate(event: PageEvent): void {
    const currentPage = event.pageIndex + 1;
    this.loadClients(currentPage);
  }

  toggleClient(element: any): void {
    this.selectedClients = element;
  }

  addClient() {
    const clientsSelected = this.selectedClients;
    const idsClients = clientsSelected.map((c: any) => c._id);
    const clients = this.store.selectSnapshot(ScheduleState.clients);
    const maxCount = this.store.selectSnapshot(ScheduleState.maxCount);
    let validClient = true;
    clients.forEach((c: any) => {
      clientsSelected.forEach((cs: any) => {
        if (c._id === cs._id) {
          this.snackbar.showError(
            `El cliente ${cs.email} ya se encuentra asignado`,
            'Aceptar',
          );
          validClient = false;
        }
      });
    });

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

      const clientSelected = clientsAssignable.filter((c: any) =>
        idsClients.includes(c._id),
      );
      this.dialogRef.close(clientSelected);
    }
  }
}
