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
import { ExerciseState } from '@features/exercises/state/exercise.state';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import {
  CreateExercise,
  GetExerciseById,
  GetExercisesByPage,
  UpdateExercise,
} from '@features/exercises/state/exercise.actions';
import { SnackBarService } from '@core/services/snackbar.service';
import { Exercise } from '@features/exercises/interfaces/exercise.interface';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
@Component({
  selector: 'app-exercise-form',
  styleUrls: ['./exercise-form.component.css'],
  templateUrl: './exercise-form.component.html',
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
export class ExerciseFormComponent implements OnInit, OnDestroy {
  constructor(
    public dialogRef: MatDialogRef<ExerciseFormComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { isEdit: boolean; exerciseId: string },
    private fb: FormBuilder,
    private store: Store,
    private actions: Actions,
    private snackbar: SnackBarService,
  ) {}

  loading$: Observable<boolean> = this.store.select(
    ExerciseState.exerciseLoading,
  );
  exerciseForm!: FormGroup;
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
    this.exerciseForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      //gifUrl: [''],
      type: ['', Validators.required],
      //mode: ['', Validators.required],

      minutes: [{ value: '', disabled: true }],
      rest: [{ value: '', disabled: true }],
      reps: [{ value: '', disabled: true }],
      series: [{ value: '', disabled: true }],
    });

    this.exerciseForm.get('type')?.valueChanges.subscribe((type) => {
      this.toggleExerciseFields(type);
    });

    if (this.data.isEdit && this.data.exerciseId) {
      this.store.dispatch(new GetExerciseById(this.data.exerciseId));
      this.actions
        .pipe(ofActionSuccessful(GetExerciseById), takeUntil(this.destroy))
        .subscribe(() => {
          const exerciseEditing = this.store.selectSnapshot(
            ExerciseState.exerciseEditing,
          );
          if (exerciseEditing) this.setDataForEdit(exerciseEditing);
        });
    }
  }

  setDataForEdit(exerciseEditing: Exercise): void {
    this.title = 'Editar ejercicio';
    this.btnTitle = 'Guardar';
    this.exerciseForm.patchValue(exerciseEditing);
    this.toggleExerciseFields(exerciseEditing.type);
  }

  toggleExerciseFields(type: string): void {
    if (type === 'cardio') {
      this.exerciseForm.get('minutes')?.enable();
      this.exerciseForm
        .get('minutes')
        ?.setValidators([Validators.required, Validators.min(1)]);

      this.exerciseForm.get('rest')?.enable();
      this.exerciseForm
        .get('rest')
        ?.setValidators([Validators.required, Validators.min(1)]);

      // Deshabilita y quita validadores para los campos que no aplican
      this.exerciseForm.get('reps')?.disable();
      this.exerciseForm.get('reps')?.clearValidators();

      this.exerciseForm.get('series')?.disable();
      this.exerciseForm.get('series')?.clearValidators();
    } else if (type === 'room') {
      this.exerciseForm.get('reps')?.enable();
      this.exerciseForm
        .get('reps')
        ?.setValidators([Validators.required, Validators.min(1)]);

      this.exerciseForm.get('series')?.enable();
      this.exerciseForm
        .get('series')
        ?.setValidators([Validators.required, Validators.min(1)]);

      // Deshabilita y quita validadores para los campos que no aplican
      this.exerciseForm.get('minutes')?.disable();
      this.exerciseForm.get('minutes')?.clearValidators();

      this.exerciseForm.get('rest')?.disable();
      this.exerciseForm.get('rest')?.clearValidators();
    }

    // Actualiza la validez de los campos condicionales
    this.exerciseForm.get('minutes')?.updateValueAndValidity();
    this.exerciseForm.get('rest')?.updateValueAndValidity();
    this.exerciseForm.get('reps')?.updateValueAndValidity();
    this.exerciseForm.get('series')?.updateValueAndValidity();
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.exerciseForm.valid) {
      if (this.data.isEdit && this.data.exerciseId) this.update();
      else this.create();
    }
  }

  update(): void {
    this.store.dispatch(
      new UpdateExercise(this.exerciseForm.value, this.data.exerciseId),
    );
    this.actions
      .pipe(ofActionSuccessful(UpdateExercise), takeUntil(this.destroy))
      .subscribe(() => {
        this.store.dispatch(
          new GetExercisesByPage({
            page: 1,
          }),
        );
        this.snackbar.showSuccess('Ejercicio actualizado correctamente', 'OK');
        this.dialogRef.close();
      });
  }

  create(): void {
    this.exerciseForm.value.mode = 'NO SE QUE PONER ACA';
    this.store.dispatch(new CreateExercise(this.exerciseForm.value));
    this.actions
      .pipe(ofActionSuccessful(CreateExercise), takeUntil(this.destroy))
      .subscribe(() => {
        this.store.dispatch(
          new GetExercisesByPage({
            page: 1,
          }),
        );
        this.snackbar.showSuccess('Ejercicio creado correctamente', 'OK');
        this.dialogRef.close();
      });
  }
}
