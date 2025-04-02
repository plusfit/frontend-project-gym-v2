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

import { Observable, Subject } from 'rxjs';
import { Store } from '@ngxs/store';

import { LoaderComponent } from '@shared/components/loader/loader.component';
import { SubRoutinesState } from '@features/sub-routines/state/sub-routine.state';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AddExerciseDialogComponent } from '@features/sub-routines/components/add-exercise-dialog/add-exercise-dialog.component';
import { Exercise } from '@features/exercises/interfaces/exercise.interface';
import { SubRoutine } from '@features/sub-routines/interfaces/sub-routine.interface';
import {
  cleanSubRoutineExercises,
  CreateSubRoutine,
  UpdateSelectedSubRoutine,
  UpdateSubRoutine,
} from '@features/sub-routines/state/sub-routine.actions';
import { SnackBarService } from '@core/services/snackbar.service';
import { DragAndDropSortingComponent } from '../../../../shared/components/drag-and-drop-sorting/drag-and-drop-sorting.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { MatDivider } from '@angular/material/divider';
import { TitleComponent } from '@shared/components/title/title.component';
import { TextAreaComponent } from '@shared/components/text-area/text-area.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
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
    DragAndDropSortingComponent,
    InputComponent,
    MatDivider,
    TitleComponent,
    TextAreaComponent,
    MatFormField,
    MatSelect,
    MatOption,
    MatLabel,
  ],
})
export class SubRoutineFormComponent implements OnInit, OnDestroy, OnChanges {
  isEdit: InputSignal<boolean> = input<boolean>(false);
  id: InputSignal<string> = input<string>('');
  subRoutineForm!: FormGroup;
  selectedExercises: Exercise[] = [];
  loading$!: Observable<boolean | null>;
  title = 'Crear Subrutina';
  btnTitle = 'Crear';

  categories = [
    { value: 'cardio', viewValue: 'Cardio' },
    { value: 'room', viewValue: 'Sala' },
    { value: 'mix', viewValue: 'Mixto' },
  ];

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
    this.store.dispatch(new cleanSubRoutineExercises());
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.loading$ = this.store.select(SubRoutinesState.isLoading);
    this.subRoutineForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  get nameControl(): FormControl {
    return this.subRoutineForm.get('name') as FormControl;
  }

  get descriptionControl(): FormControl {
    return this.subRoutineForm.get('description') as FormControl;
  }

  ngOnChanges(): void {
    if (this.isEdit()) {
      this.title = 'Editar Subrutina';
      this.btnTitle = 'Guardar';

      const subRoutine: SubRoutine | null = this.store.selectSnapshot(
        SubRoutinesState.getSelectedSubRoutine,
      );
      this.selectedExercises = subRoutine?.exercises || [];

      if (subRoutine) this.subRoutineForm.patchValue(subRoutine);
    }
  }

  openAddExerciseDialog(): void {
    const dialogRef = this.dialog.open(AddExerciseDialogComponent, {
      width: '40rem',
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
          this.snackBarService.showSuccess('Éxito!', 'Subrutina actualizada');
          this.location.back();
        });
    } else {
      this.store.dispatch(new CreateSubRoutine(payload)).subscribe(() => {
        this.snackBarService.showSuccess('Éxito!', 'Subrutina creada');
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
}
