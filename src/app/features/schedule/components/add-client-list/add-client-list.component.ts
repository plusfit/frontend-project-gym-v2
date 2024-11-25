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
} from '@features/schedule/state/schedule.actions';
import { ScheduleState } from '@features/schedule/state/schedule.state';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { BtnDirective } from '@shared/directives/btn/btn.directive';
import { InputDirective } from '@shared/directives/btn/input.directive';
import { debounceTime, map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-add-client-list',
  standalone: true,
  imports: [
    MatListModule,
    FormsModule,
    ReactiveFormsModule,
    BtnDirective,
    InputDirective,
  ],
  templateUrl: './add-client-list.component.html',
  styleUrl: './add-client-list.component.css',
})
export class AddClientListComponent implements OnInit {
  clients!: any;
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
    this.store.dispatch(new getClientsAssignable());
    this.actions
      .pipe(ofActionSuccessful(getClientsAssignable))
      .subscribe(() => {
        const clients = this.store.selectSnapshot(
          (state) => state.schedule.clientsAssignable,
        );
        this.clients = clients.data;
        this.filteredClients = [...this.clients]; // Inicializar lista filtrada
        // Suscribirse a cambios en el campo de búsqueda
        this.searchControl.valueChanges
          .pipe(
            startWith(''),
            debounceTime(300), // Espera para evitar filtrados constantes
            map((value: string) => this.filterClients(value)),
          )
          .subscribe((filtered: any[]) => {
            this.filteredClients = filtered;
          });
      });
  }

  addClient() {
    const client = this.form.value.clients[0];
    const clients = this.store.selectSnapshot(ScheduleState.clients);
    let validClient = true;
    clients.forEach((c: any) => {
      if (c._id === client) {
        this.snackbar.showError('El cliente ya ha sido asignado', 'Aceptar');
        validClient = false;
        return;
      }
    });
    if (validClient) {
      this.store.dispatch(new AssignClient(this.data.id, client));
      this.actions.pipe(ofActionSuccessful(AssignClient)).subscribe(() => {
        this.snackbar.showSuccess('Cliente asignado correctamente', 'Aceptar');
      });
      const clientsAssignable = this.store.selectSnapshot(
        ScheduleState.clientsAssignable,
      );
      const clientSelected = clientsAssignable.find(
        (c: any) => c._id === client,
      );
      this.dialogRef.close(clientSelected);
    }
  }

  // Filtra la lista de clientes según el término de búsqueda
  filterClients(searchTerm: string): any[] {
    if (!searchTerm) {
      return this.clients; // Devuelve todos los clientes si no hay término
    }
    console.log('validClient', this.clientsControl);

    const lowerCaseTerm = searchTerm.toLowerCase();
    return this.clients.filter((client: any) =>
      client.email.toLowerCase().includes(lowerCaseTerm),
    );
  }
}
