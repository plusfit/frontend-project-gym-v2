import { CommonModule } from '@angular/common';
import {
  Component,
  input,
  InputSignal,
  OnChanges,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { BtnDirective } from '@shared/directives/btn/btn.directive';
import { Observable, Subject } from 'rxjs';

import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import {
  Routine,
  RoutinePayload,
} from '@features/routines/interfaces/routine.interface';
import { RoutineState } from '@features/routines/state/routine.state';
import { SnackBarService } from '@core/services/snackbar.service';
import { AddSubroutineDialogComponent } from '@features/routines/components/add-subrutine-dialog/add-subrutine-dialog.component';
import {
  CreateRoutine,
  UpdateRoutine,
  UpdateSubRoutines,
} from '@features/routines/state/routine.actions';
import { SubRoutine } from '@features/sub-routines/interfaces/sub-routine.interface';
import { SubRoutinesState } from '@features/sub-routines/state/sub-routine.state';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { Location } from '@angular/common';

import { DragAndDropSortingComponent } from '@shared/components/drag-and-drop-sorting/drag-and-drop-sorting.component';
import { InputComponent } from '@shared/components/input/input.component';
import { TextAreaComponent } from '@shared/components/text-area/text-area.component';
import { MatDivider } from '@angular/material/divider';
import { TitleComponent } from '@shared/components/title/title.component';
@Component({
  selector: 'app-routine-form',
  templateUrl: './routine-form.component.html',
  styleUrls: ['./routine-form.component.css'],
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
    TextAreaComponent,
    MatDivider,
    TitleComponent,
  ],
})
export class RoutineFormComponent implements OnInit, OnDestroy, OnChanges {
  isEdit: InputSignal<boolean> = input<boolean>(false);
  id: InputSignal<string> = input<string>('');
  routineForm!: FormGroup;
  selectedSubroutines: any[] = [];
  loading$!: Observable<boolean | null>;
  title = 'Crear Rutina';
  btnTitle = 'Crear';
  displayedColumns: string[] = ['day', 'name', 'type', 'isCustom', 'acciones'];

  categories = [
    { value: 'cardio', viewValue: 'Cardio' },
    { value: 'room', viewValue: 'Sala' },
  ];

  days = [
    'Lunes',
    'Martes',
    'Miercoles',
    'Jueves',
    'Viernes',
    'Sabado',
    'Domingo',
  ];

  private destroy = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private dialog: MatDialog,
    private snackBarService: SnackBarService,
    private location: Location,
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
      isCustom: [{ value: false, disabled: true }],
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

  openAddSubRoutinesDialog(): void {
    const dialogRef = this.dialog.open(AddSubroutineDialogComponent, {
      width: '40rem',
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

    const routine: Routine | null = this.store.selectSnapshot(
      RoutineState.selectedRoutine,
    );

    const subRoutinesIds = routine?.subRoutines.map((sub) => sub._id);

    const payload: RoutinePayload = {
      ...this.routineForm.getRawValue(),
      subRoutines: subRoutinesIds,
    };
    if (this.isEdit()) {
      this.store
        .dispatch(new UpdateRoutine(this.id(), payload))
        .subscribe(() => {
          this.snackBarService.showSuccess('Exito!', 'Rutina actualizada');
          this.location.back();
        });
    } else {
      this.store.dispatch(new CreateRoutine(payload)).subscribe(() => {
        this.snackBarService.showSuccess('Exito!', 'Rutina creada');
        this.location.back();
      });
    }
  }

  goBack() {
    this.location.back();
  }

  handleList(e: any[]) {
    const newRoutine = {
      ...this.routineForm.value,
      subRoutines: e,
    };
    this.store.dispatch(new UpdateSubRoutines(newRoutine));
  }

  get nameControl(): FormControl {
    return this.routineForm.get('name') as FormControl;
  }

  get descriptionControl(): FormControl {
    return this.routineForm.get('description') as FormControl;
  }
}
