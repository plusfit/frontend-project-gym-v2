import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { SnackBarService } from '@core/services/snackbar.service';
import {
  DeleteClient,
  getClientsArray,
} from '@features/schedule/state/schedule.actions';
import { ScheduleState } from '@features/schedule/state/schedule.state';
import { Actions, Store } from '@ngxs/store';
import { BtnDirective } from '@shared/directives/btn/btn.directive';
import { InputDirective } from '@shared/directives/btn/input.directive';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AddClientListComponent } from '../add-client-list/add-client-list.component';

@Component({
  selector: 'app-schedule-form',
  standalone: true,
  imports: [ReactiveFormsModule, BtnDirective, InputDirective],
  templateUrl: './schedule-form.component.html',
  styleUrl: './schedule-form.component.css',
})
export class ScheduleFormComponent implements OnInit, OnDestroy {
  editForm!: FormGroup;
  clients: any[] = [];
  clients$: Observable<any[]> = this.store.select(ScheduleState.clients);

  private destroy = new Subject<void>();

  constructor(
    private store: Store,
    private actions: Actions,
    private snackbar: SnackBarService,
    public dialogRef: MatDialogRef<ScheduleFormComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { day: any; title: string },
    private fb: FormBuilder,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      clients: this.fb.array([]),
      maxCount: [this.data.day?.maxCount, [Validators.required]],
    });

    this.initClients();
  }

  // Inicializa los clientes existentes en el FormArray
  initClients() {
    const clientsForSend = this.data.day.clients.map((client: any) => client);
    if (!clientsForSend.length) return;
    this.store.dispatch(new getClientsArray(clientsForSend));
    this.actions.pipe(takeUntil(this.destroy)).subscribe(() => {
      const clients = this.store.selectSnapshot(ScheduleState.clients);

      this.clients = clients;
    });
  }

  // Métodos para gestionar clientes
  addClient() {
    const clonedData = JSON.parse(JSON.stringify(this.data.day._id));
    this.dialog
      .open(AddClientListComponent, {
        width: '500px',
        data: {
          title: 'Agregar cliente',
          id: clonedData,
        },
      })
      .afterClosed()
      .subscribe((client: any) => {
        if (!client) {
          return;
        }
        this.clients = [...this.clients, client];
      });
  }

  removeClient(index: number) {
    const clientToRemove = this.clients[index]._id; // Obtén el cliente específico basado en el índice
    this.store.dispatch(new DeleteClient(this.data.day._id, clientToRemove));

    // Escucha cuando se complete la acción
    this.actions.pipe(takeUntil(this.destroy)).subscribe(() => {
      this.snackbar.showSuccess('Cliente eliminado', 'Aceptar');
      // Filtra la lista utilizando el identificador único
      this.clients = this.clients.filter(
        (client) => client._id !== clientToRemove,
      );
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
    this.dialogRef.close({
      clients: this.clients,
      maxCount: this.editForm.value.maxCount,
    });
  }
}
