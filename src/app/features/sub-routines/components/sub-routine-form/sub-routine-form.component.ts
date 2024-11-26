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
import { AddExerciseDialogComponent } from '@features/sub-routines/components/add-exercise-dialog/add-exercise-dialog.component';
import { Exercise } from '@features/exercises/interfaces/exercise.interface';
import { SubRoutine } from '@features/sub-routines/interfaces/sub-routine.interface';
import { UpdateSelectedSubRoutine } from '@features/sub-routines/state/sub-routine.actions';
@Component({
  selector: 'app-sub-routine-form',
  templateUrl: './sub-routine-form.component.html',
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    BtnDirective,
    InputDirective,
    CommonModule,
    LoaderComponent,
    FormsModule,
    TableComponent,
  ],
})
export class SubRoutineFormComponent implements OnInit, OnDestroy, OnChanges {
  isEdit: InputSignal<boolean> = input<boolean>(false);
  subRoutineForm!: FormGroup;
  selectedExercises: Exercise[] = [];
  loading$!: Observable<boolean>;
  title = 'Agregar Sub-Rutina';
  btnTitle = 'Crear';

  private destroy = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.subRoutineForm = this.fb.group({
      name: ['', Validators.required],
      isCustom: [{ value: false, disabled: true }],
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
    dialogRef
      .afterClosed()
      .subscribe((updatedSubRoutine: SubRoutine | null) => {
        if (updatedSubRoutine) {
          console.log('Updated SubRoutine:', updatedSubRoutine);
          this.selectedExercises = updatedSubRoutine.exercises;
          this.store.dispatch(new UpdateSelectedSubRoutine(updatedSubRoutine));
        }
      });
  }

  save(): void {
    // if (this.subRoutineForm.invalid) {
    //   this.subRoutineForm.markAllAsTouched();
    //   return;
    // }
    //
    // const payload = {
    //   ...this.subRoutineForm.value,
    //   exercises: this.selectedExercises.map((e) => e),
    // };
    //
    // console.log('Saving SubRoutine:', payload);
  }

  goBack() {
    this.router.navigate(['/sub-rutinas']);
  }
}
