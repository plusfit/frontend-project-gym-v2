import { AsyncPipe } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
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
  EditHour,
  postClientsArray,
} from '@features/schedule/state/schedule.actions';
import { ScheduleState } from '@features/schedule/state/schedule.state';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { BtnDirective } from '@shared/directives/btn/btn.directive';
import { InputDirective } from '@shared/directives/btn/input.directive';
import { Observable, Subject, takeUntil } from 'rxjs';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { AddClientListComponent } from '../add-client-list/add-client-list.component';

@Component({
  selector: 'app-schedule-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    BtnDirective,
    InputDirective,
    AsyncPipe,
    InputComponent,
  ],
  templateUrl: './schedule-form.component.html',
  styleUrl: './schedule-form.component.css',
})
export class ScheduleFormComponent implements OnInit, OnDestroy {
  editForm!: FormGroup;
  clients$: Observable<any[]> = this.store.select(ScheduleState.clients);
  loading$: Observable<boolean> = this.store.select(
    ScheduleState.scheduleLoading,
  );

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
      maxCount: [this.data.day?.hour.maxCount, [Validators.required]],
    });

    this.initClients();
  }

  get maxCountControl(): FormControl {
    return this.editForm.get('maxCount') as FormControl;
  }

  // Inicializa los clientes existentes en el FormArray
  initClients() {
    const clientsForSend = this.data.day.hour.clients.map(
      (client: any) => client,
    );
    if (!clientsForSend.length) return;
    this.store.dispatch(new postClientsArray(clientsForSend));
  }

  // Métodos para gestionar clientes
  addClient() {
    const clonedData = JSON.parse(JSON.stringify(this.data.day.hour._id));
    this.dialog.open(AddClientListComponent, {
      width: '500px',
      data: {
        title: 'Agregar cliente',
        id: clonedData,
      },
    });
  }

  removeClient(id: string) {
    this.store.dispatch(new DeleteClient(this.data.day.hour._id, id));

    // Escucha cuando se complete la acción
    this.actions
      .pipe(ofActionSuccessful(DeleteClient), takeUntil(this.destroy))
      .subscribe(() => {
        this.snackbar.showSuccess('Cliente eliminado', 'Aceptar');
      });
  }

  editCount() {
    if (this.editForm.invalid) return;

    if (this.editForm.value.maxCount < this.data.day.hour.clients.length) {
      this.snackbar.showError(
        'El número de clientes no puede ser menor a los clientes ya agendados',
        'Eliiminar clientes',
      );
      return;
    }

    const data = {
      startTime: this.data.day.hour.startTime,
      endTime: this.data.day.hour.endTime,
      maxCount: this.editForm.value.maxCount,
      clients: this.data.day.hour.clients,
      day: this.data.day.day.day,
    };

    this.store.dispatch(new EditHour(this.data.day.hour._id, data));
    this.actions.pipe(ofActionSuccessful(EditHour)).subscribe(() => {
      this.snackbar.showSuccess('Horario actualizado', 'Aceptar');
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
