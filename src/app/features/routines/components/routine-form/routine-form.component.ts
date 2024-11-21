import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { BtnDirective } from '@shared/directives/btn/btn.directive';
import { InputDirective } from '@shared/directives/btn/input.directive';
import { Observable, Subject, takeUntil } from 'rxjs';
import { RoutineState } from '@features/routines/state/routine.state';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import {
  CreateRoutine,
  GetRoutineById,
  GetRoutinesByPage,
  UpdateRoutine,
} from '@features/routines/state/routine.actions';
import { SnackBarService } from '@core/services/snackbar.service';
import { Routine } from '@features/routines/interfaces/routine.interface';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
@Component({
  selector: 'app-routine-form',
  styleUrls: ['./routine-form.component.css'],
  templateUrl: './routine-form.component.html',
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    NgIf,
    BtnDirective,
    InputDirective,
    CommonModule,
    LoaderComponent,
  ],
})
export class RoutineFormComponent implements OnInit, OnDestroy {
  constructor(
    public dialogRef: MatDialogRef<RoutineFormComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { isEdit: boolean; routineId: string },
    private fb: FormBuilder,
    private store: Store,
    private actions: Actions,
    private snackbar: SnackBarService,
  ) {}

  loading$: Observable<boolean> = this.store.select(
    RoutineState.routineLoading,
  );
  routineForm!: FormGroup;
  private destroy = new Subject<void>();
  title = 'Agregar ejercicio';
  btnTitle = 'Crear';

  types = [
    { value: 'cardio', viewValue: 'Cardio' },
    { value: 'room', viewValue: 'Sala' },
  ];

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.routineForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      //gifUrl: [''],
      type: ['', Validators.required],
      //mode: ['', Validators.required],
      rest: ['', [Validators.required, Validators.min(1)]],

      minutes: [{ value: '', disabled: true }],
      reps: [{ value: '', disabled: true }],
      series: [{ value: '', disabled: true }],
    });

    this.routineForm.get('type')?.valueChanges.subscribe((type) => {
      this.toggleRoutineFields(type);
    });

    if (this.data.isEdit && this.data.routineId) {
      this.store.dispatch(new GetRoutineById(this.data.routineId));
      this.actions
        .pipe(ofActionSuccessful(GetRoutineById), takeUntil(this.destroy))
        .subscribe(() => {
          const routineEditing = this.store.selectSnapshot(
            RoutineState.routineEditing,
          );
          if (routineEditing) this.setDataForEdit(routineEditing);
        });
    }
  }

  setDataForEdit(routineEditing: Routine): void {
    this.title = 'Editar ejercicio';
    this.btnTitle = 'Guardar';
    this.routineForm.patchValue(routineEditing);
  }

  toggleRoutineFields(type: string): void {
    if (type === 'cardio') {
      this.routineForm.get('minutes')?.enable();
      this.routineForm
        .get('minutes')
        ?.setValidators([Validators.required, Validators.min(1)]);

      // Deshabilita y quita validadores para los campos que no aplican
      this.routineForm.get('reps')?.disable();
      this.routineForm.get('reps')?.clearValidators();

      this.routineForm.get('series')?.disable();
      this.routineForm.get('series')?.clearValidators();
    } else if (type === 'room') {
      this.routineForm.get('reps')?.enable();
      this.routineForm
        .get('reps')
        ?.setValidators([Validators.required, Validators.min(1)]);

      this.routineForm.get('series')?.enable();
      this.routineForm
        .get('series')
        ?.setValidators([Validators.required, Validators.min(1)]);

      // Deshabilita y quita validadores para los campos que no aplican
      this.routineForm.get('minutes')?.disable();
      this.routineForm.get('minutes')?.clearValidators();
    }

    // Actualiza la validez de los campos condicionales
    this.routineForm.get('minutes')?.updateValueAndValidity();
    this.routineForm.get('rest')?.updateValueAndValidity();
    this.routineForm.get('reps')?.updateValueAndValidity();
    this.routineForm.get('series')?.updateValueAndValidity();
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.routineForm.valid) {
      if (this.data.isEdit && this.data.routineId) this.update();
      else this.create();
    }
  }

  update(): void {
    this.store.dispatch(
      new UpdateRoutine(this.routineForm.value, this.data.routineId),
    );
    this.actions
      .pipe(ofActionSuccessful(UpdateRoutine), takeUntil(this.destroy))
      .subscribe(() => {
        this.store.dispatch(
          new GetRoutinesByPage({
            page: 1,
          }),
        );
        this.snackbar.showSuccess('Ejercicio actualizado correctamente', 'OK');
        this.dialogRef.close();
      });
  }

  create(): void {
    this.store.dispatch(new CreateRoutine(this.routineForm.value));
    this.actions
      .pipe(ofActionSuccessful(CreateRoutine), takeUntil(this.destroy))
      .subscribe(() => {
        this.store.dispatch(
          new GetRoutinesByPage({
            page: 1,
          }),
        );
        this.snackbar.showSuccess('Ejercicio creado correctamente', 'OK');
        this.dialogRef.close();
      });
  }
}
