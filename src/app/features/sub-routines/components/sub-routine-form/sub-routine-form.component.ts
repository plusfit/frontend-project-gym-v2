import {
  Component,
  input,
  InputSignal,
  OnDestroy,
  OnInit,
  OnChanges,
} from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BtnDirective } from '@shared/directives/btn/btn.directive';
import { InputDirective } from '@shared/directives/btn/input.directive';
import { Observable, Subject } from 'rxjs';
import { Store } from '@ngxs/store';

import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { SubRoutinesState } from '@features/sub-routines/state/sub-routine.state';
import { TableComponent } from '@shared/components/table/table.component';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AddExerciseDialogComponent } from '@features/sub-routines/components/add-exercise-dialog/add-exercise-dialog.component';
import { Exercise } from '@features/exercises/interfaces/exercise.interface';
import { SubRoutine } from '@features/sub-routines/interfaces/sub-routine.interface';
import {
  CreateSubRoutine,
  UpdateSelectedSubRoutine,
  UpdateSubRoutine,
} from '@features/sub-routines/state/sub-routine.actions';
import { SnackBarService } from '@core/services/snackbar.service';
import { EDay } from '@core/enums/day.enum';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { DragAndDropSortingComponent } from '../../../../shared/components/drag-and-drop-sorting/drag-and-drop-sorting.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
@Component({
  selector: 'app-sub-routine-form',
  templateUrl: './sub-routine-form.component.html',
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    BtnDirective,

    CommonModule,
    LoaderComponent,
    FormsModule,

    MatFormField,
    MatSelect,
    MatOption,
    MatLabel,
    DragAndDropSortingComponent,
    InputComponent,
  ],
})
export class SubRoutineFormComponent implements OnInit, OnDestroy, OnChanges {
  isEdit: InputSignal<boolean> = input<boolean>(false);
  id: InputSignal<string> = input<string>('');
  subRoutineForm!: FormGroup;
  selectedExercises: Exercise[] = [];
  loading$!: Observable<boolean | null>;
  title = 'Subrutina';
  btnTitle = 'Crear';

  private destroy = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router,
    private location: Location,
    private dialog: MatDialog,
    private snackBarService: SnackBarService,
  ) {}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.loading$ = this.store.select(SubRoutinesState.isLoading);
    this.subRoutineForm = this.fb.group({
      name: ['', Validators.required],
      isCustom: [false],
    });
  }

  ngOnChanges(): void {
    if (this.isEdit()) {
      this.title = 'Editar Sub-Rutina';
      this.btnTitle = 'Guardar';

      const subRoutine: SubRoutine | null = this.store.selectSnapshot(
        SubRoutinesState.getSelectedSubRoutine,
      );
      this.selectedExercises = subRoutine?.exercises || [];

      if (subRoutine) this.subRoutineForm.patchValue(subRoutine);
    }
  }

  removeExercise(id: string): void {
    this.selectedExercises = this.selectedExercises.filter(
      (exercise) => exercise._id !== id,
    );
  }

  openAddExerciseDialog(): void {
    const dialogRef = this.dialog.open(AddExerciseDialogComponent, {
      width: '600px',
    });
    dialogRef.afterClosed().subscribe((newExercises: Exercise[]) => {
      if (newExercises) {
        const newSubRoutine = {
          ...this.subRoutineForm.value,
          exercises: newExercises,
        };
        this.selectedExercises = newExercises;
        this.store.dispatch(new UpdateSelectedSubRoutine(newSubRoutine));
      }
    });
  }

  save(): void {
    if (this.subRoutineForm.invalid) {
      this.subRoutineForm.markAllAsTouched();
      return;
    }

    if (this.selectedExercises.length === 0) {
      this.snackBarService.showWarning(
        'Falta información',
        'Debe seleccionar al menos un ejercicio',
      );
      return;
    }

    const subRoutine: SubRoutine | null = this.store.selectSnapshot(
      SubRoutinesState.getSelectedSubRoutine,
    );
    const _exercises = subRoutine?.exercises.map((e) => e._id);

    const payload = {
      ...this.subRoutineForm.value,
      exercises: _exercises,
    };

    if (this.isEdit()) {
      this.store
        .dispatch(new UpdateSubRoutine(this.id(), payload))
        .subscribe(() => {
          this.snackBarService.showSuccess('Exito!', 'Subrutina actualizada');
          this.location.back();
        });
    } else {
      this.store.dispatch(new CreateSubRoutine(payload)).subscribe(() => {
        this.snackBarService.showSuccess('Exito!', 'Subrutina creada');
        this.location.back();
      });
    }
  }

  goBack() {
    this.location.back();
  }

  handleList(e: any[]) {
    const newSubRoutine = {
      ...this.subRoutineForm.value,
      exercises: e,
    };
    this.store.dispatch(new UpdateSelectedSubRoutine(newSubRoutine));
  }

  get nameControl(): FormControl {
    return this.subRoutineForm.get('name') as FormControl;
  }

  protected readonly EDay = EDay;
}
