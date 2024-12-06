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
import { AddSubroutineDialogComponent } from '@features/routines/components/add-subrutine-dialog/add-subrutine-dialog.component';
import { SubRoutine } from '@features/sub-routines/interfaces/sub-routine.interface';
import { SnackBarService } from '@core/services/snackbar.service';
import { EDay } from '@core/enums/day.enum';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { Routine } from '@features/routines/interfaces/routine.interface';
import { RoutineState } from '@features/routines/state/routine.state';
import {
  CreateRoutine,
  UpdateRoutine,
  UpdateSubRoutines,
} from '@features/routines/state/routine.actions';
import { EditSubroutineDayDialogComponent } from '../edit-subroutine-day-dialog/edit-subroutine-day-dialog.component';

import e from 'express';
import { DragAndDropSortingComponent } from '../../../../shared/components/drag-and-drop-sorting/drag-and-drop-sorting.component';
@Component({
  selector: 'app-routine-form',
  templateUrl: './routine-form.component.html',
  styleUrls: ['./routine-form.component.css'],
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
    MatFormField,
    MatSelect,
    MatOption,
    MatLabel,
    DragAndDropSortingComponent,
  ],
})
export class RoutineFormComponent implements OnInit, OnDestroy, OnChanges {
  isEdit: InputSignal<boolean> = input<boolean>(false);
  id: InputSignal<string> = input<string>('');
  routineForm!: FormGroup;
  selectedSubroutines: any[] = [];
  loading$!: Observable<boolean | null>;
  title = 'Agregar Rutina';
  btnTitle = 'Crear';
  displayedColumns: string[] = ['day', 'name', 'type', 'isCustom', 'acciones'];

  listToSort: any[] = [];

  categories = [
    { value: 'cardio', viewValue: 'Cardio' },
    { value: 'room', viewValue: 'Sala' },
  ];

  private destroy = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router,
    private dialog: MatDialog,
    private snackBarService: SnackBarService,
  ) {}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.loading$ = this.store.select(SubRoutinesState.isLoading);
    this.routineForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      isCustom: [false],
      days: ['', Validators.required],
    });
  }

  ngOnChanges(): void {
    if (this.isEdit()) {
      this.title = 'Editar Rutina';
      this.btnTitle = 'Guardar';

      const routine: Routine | null = this.store.selectSnapshot(
        RoutineState.selectedRoutine,
      );
      this.selectedSubroutines = routine?.subRoutines || [];

      if (routine) this.routineForm.patchValue(routine);
    }
  }

  removeExercise(id: string): void {
    this.selectedSubroutines = this.selectedSubroutines.filter(
      (subroutine) => subroutine._id !== id,
    );
  }

  openAddSubRoutinesDialog(): void {
    const dialogRef = this.dialog.open(AddSubroutineDialogComponent, {
      width: '600px',
    });
    dialogRef.afterClosed().subscribe((newSubRoutines: SubRoutine[]) => {
      if (newSubRoutines) {
        const newRoutine = {
          ...this.routineForm.value,
          subRoutines: newSubRoutines,
        };
        this.selectedSubroutines = newSubRoutines;
        this.store.dispatch(new UpdateSubRoutines(newRoutine));
      }
    });
  }

  save(): void {
    if (this.routineForm.invalid) {
      this.routineForm.markAllAsTouched();
      return;
    }

    if (this.selectedSubroutines.length === 0) {
      this.snackBarService.showWarning(
        'Falta información',
        'Debe seleccionar al menos una subrutina',
      );
      return;
    }
    const payload = {
      ...this.routineForm.value,
      subRoutines: this.selectedSubroutines.map((r) => r._id),
    };

    if (this.isEdit()) {
      this.store
        .dispatch(new UpdateRoutine(this.id(), payload))
        .subscribe(() => {
          this.snackBarService.showSuccess('Exito!', 'Rutina actualizada');
          this.router.navigate(['/rutinas']);
        });
    } else {
      this.store.dispatch(new CreateRoutine(payload)).subscribe(() => {
        this.snackBarService.showSuccess('Exito!', 'Rutina creada');
        this.router.navigate(['/rutinas']);
      });
    }
  }

  handleEditDay(e: Event): void {
    const dialogRef = this.dialog.open(EditSubroutineDayDialogComponent, {
      width: '600px',
      data: e,
    });
    dialogRef.afterClosed().subscribe((subroutines: SubRoutine[]) => {
      console.log(subroutines);
    });
  }

  goBack() {
    this.router.navigate(['/rutinas']);
  }

  handleList(e: any[]) {
    const newRoutine = {
      ...this.routineForm.value,
      subRoutines: e,
    };
    this.store.dispatch(new UpdateSubRoutines(newRoutine));
  }

  protected readonly EDay = EDay;
}
