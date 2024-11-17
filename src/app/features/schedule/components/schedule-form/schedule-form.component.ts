import { Component, Inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SnackBarService } from '@core/services/snackbar.service';
import { GetClientsById } from '@features/schedule/state/schedule.actions';
import { ScheduleState } from '@features/schedule/state/schedule.state';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { BtnDirective } from '@shared/directives/btn/btn.directive';

@Component({
  selector: 'app-schedule-form',
  standalone: true,
  imports: [ReactiveFormsModule, BtnDirective],
  templateUrl: './schedule-form.component.html',
  styleUrl: './schedule-form.component.css',
})
export class ScheduleFormComponent implements OnInit {
  editForm!: FormGroup;
  constructor(
    private store: Store,
    private actions: Actions,
    private snackbar: SnackBarService,
    public dialogRef: MatDialogRef<ScheduleFormComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { day: any; title: string },
    private fb: FormBuilder,
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
    const clientsArray = this.editForm.get('clients') as FormArray;
    for (let i = 0; i < this.data.day.clients.length; i++) {
      const clientsId = this.data.day.clients[i];
      this.store.dispatch(new GetClientsById(clientsId)).subscribe();
      this.actions.pipe(ofActionSuccessful(GetClientsById)).subscribe(() => {
        const clientsState = this.store.selectSnapshot(ScheduleState.clients);
        clientsArray.push(
          this.fb.control(clientsState.data.email, [Validators.required]),
        );
      });
    }
    console.log('Clientes:', clientsArray);
  }

  // Métodos para gestionar clientes
  addClient() {
    (this.editForm.get('clients') as FormArray).push(
      this.fb.control('', [Validators.required]),
    );
  }

  removeClient(index: number) {
    (this.editForm.get('clients') as FormArray).removeAt(index);
  }

  save() {
    if (this.editForm.valid) {
      const updatedSchedule = {
        ...this.data.day,
        ...this.editForm.value,
      };
      console.log('Horario actualizado:', updatedSchedule);
      // Emitir o guardar los cambios
    }
  }
}
