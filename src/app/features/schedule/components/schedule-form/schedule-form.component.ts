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
import { MatDividerModule } from '@angular/material/divider';
import { SnackBarService } from '@core/services/snackbar.service';
import {
  DeleteClient,
  EditHour,
  SelectedClient,
  postClientsArray,
} from '@features/schedule/state/schedule.actions';
import { ScheduleState } from '@features/schedule/state/schedule.state';
import { Actions, Store, ofActionSuccessful } from '@ngxs/store';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { BtnDirective } from '@shared/directives/btn/btn.directive';
import { Observable, Subject, takeUntil } from 'rxjs';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { TitleComponent } from '../../../../shared/components/title/title.component';
import { AddClientListComponent } from '../add-client-list/add-client-list.component';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-schedule-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    BtnDirective,
    AsyncPipe,
    InputComponent,
    TitleComponent,
    MatDividerModule,
    LoaderComponent,
  ],
  templateUrl: './schedule-form.component.html',
  styleUrl: './schedule-form.component.css',
})
export class ScheduleFormComponent implements OnInit, OnDestroy {
  editForm!: FormGroup;
  clients$: Observable<any[]> = this.store.select(ScheduleState.clients);
  clientsTotal$: Observable<number> = this.store.select(
    ScheduleState.getTotalClients,
  );
  loading$: Observable<boolean> = this.store.select(
    ScheduleState.scheduleLoading,
  );
  loadingClients$: Observable<boolean> = this.store.select(
    ScheduleState.loadingAssignable,
  );
  title = '';

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
  ) { }

  ngOnInit(): void {
    this.editForm = this.fb.group({
      maxCount: [this.data.day?.hour.maxCount, [Validators.required]],
    });

    this.initClients();
    this.title = this.data.title;
  }

  get maxCountControl(): FormControl {
    return this.editForm.get('maxCount') as FormControl;
  }

  // Inicializa los clientes existentes en el FormArray
  initClients() {
    const clientsForSend = this.data.day.hour?.clients;
    if (!clientsForSend?.length) return;
    // Despachar la acción para mostrar el loading mientras carga los clientes
    this.store.dispatch(new postClientsArray(clientsForSend));
  }

  // Métodos para gestionar clientes
  addClient() {
    const clonedData = JSON.parse(JSON.stringify(this.data.day.hour._id));
    const dialogRef = this.dialog.open(AddClientListComponent, {
      width: '700px',
      data: {
        title: `Agregar cliente al horario ${this.data.day.hour.startTime} ${this.getAMorPM(this.data.day.hour.startTime)}`,
        id: clonedData,
        clients: this.data.day.hour.clients,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.store.dispatch(new SelectedClient(result));
      }
    });
  }

  removeClient(id: string, email: string) {
    //TODO: cambiar email to name cuando se agregue el campo
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: `Eliminar cliente ${email}`,
        contentMessage: '¿Estás seguro de que deseas eliminar al cliente?',
      },
    });
    dialogRef.componentInstance.confirm.subscribe((value) => {
      if (!value) return;

      this.store.dispatch(new DeleteClient(this.data.day.hour._id, id));

      this.actions
        .pipe(ofActionSuccessful(DeleteClient), takeUntil(this.destroy))
        .subscribe(() => {
          this.snackbar.showSuccess('Éxito!', 'Cliente eliminado');
        });
    });
  }

  editCount() {
    if (this.editForm.invalid) return;

    if (this.editForm.value.maxCount < this.data.day.hour.clients.length) {
      this.snackbar.showError(
        'Error!',
        'El número de clientes no puede ser menor a los clientes ya agendados',
      );
      return;
    }

    const data = {
      startTime: this.data.day.hour.startTime,
      endTime: this.data.day.hour.endTime,
      maxCount: this.editForm.value.maxCount,
      day: this.data.day.name,
    };

    this.store.dispatch(new EditHour(this.data.day.hour._id, data));
    this.actions.pipe(ofActionSuccessful(EditHour)).subscribe(() => {
      this.snackbar.showSuccess('Éxito!', 'Horario actualizado');
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  getAMorPM(time: string) {
    const hour = parseInt(time.split(':')[0]);
    return hour < 12 ? 'AM' : 'PM';
  }
}
