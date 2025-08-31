import { CommonModule } from '@angular/common';
import {
  Component,
  InputSignal,
  OnChanges,
  OnDestroy,
  OnInit,
  input,
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
import { Observable, Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { Location } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { SnackBarService } from '@core/services/snackbar.service';
import { AddSubroutineDialogComponent } from '@features/routines/components/add-subrutine-dialog/add-subrutine-dialog.component';
import {
  Routine,
  RoutinePayload,
  RoutineType,
} from '@features/routines/interfaces/routine.interface';
import {
  ClearSubRoutines,
  CreateRoutine, GetRoutinesByPage, UpdateRoutine,
  UpdateSubRoutines
} from '@features/routines/state/routine.actions';
import { RoutineState } from '@features/routines/state/routine.state';
import { SubRoutine } from '@features/sub-routines/interfaces/sub-routine.interface';
import { SubRoutinesState } from '@features/sub-routines/state/sub-routine.state';
import { LoaderComponent } from '@shared/components/loader/loader.component';

import { MatCheckbox } from '@angular/material/checkbox';
import { MatDivider } from '@angular/material/divider';
import { ActivatedRoute } from '@angular/router';
import { RoutineClient } from '@features/client/state/clients.actions';
import { ClientsState } from '@features/client/state/clients.state';
import { DragAndDropSortingComponent } from '@shared/components/drag-and-drop-sorting/drag-and-drop-sorting.component';
import { InputComponent } from '@shared/components/input/input.component';
import { TextAreaComponent } from '@shared/components/text-area/text-area.component';
import { TitleComponent } from '@shared/components/title/title.component';
import { EDays } from '@shared/enums/days-enum';
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
    MatCheckbox,
  ],
})
export class RoutineFormComponent implements OnInit, OnDestroy, OnChanges {
  isEdit: InputSignal<boolean> = input<boolean>(false);
  id: InputSignal<string> = input<string>('');
  routineForm!: FormGroup;
  selectedSubroutines: SubRoutine[] = [];
  loading$!: Observable<boolean | null>;
  title = 'Crear Rutina';
  btnTitle = 'Crear';
  displayedColumns = ['day', 'name', 'type', 'isCustom', 'acciones'];
  idClient = '';
  routine!: Routine | null;
  pathClient = false;
  activeScreenRoutines = 0;
  private isInitializing = true;

  days = Object.values(EDays);

  private destroy = new Subject<void>();

  types = [
    { value: RoutineType.MEN, label: 'Hombre' },
    { value: RoutineType.WOMEN, label: 'Mujer' },
    { value: RoutineType.CARDIO, label: 'Cardio' },
  ];

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private dialog: MatDialog,
    private snackBarService: SnackBarService,
    private location: Location,
    private route: ActivatedRoute,
  ) {}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new ClearSubRoutines());
  }

  ngOnInit(): void {
    this.route.url.subscribe((urlSegments) => {
      this.pathClient = urlSegments[0].path === 'clientes';
    });
    if (this.pathClient) {
      this.idClient = this.route.snapshot.paramMap.get('id') ?? '';
    }

    this.loading$ = this.store.select(SubRoutinesState.isLoading);

    if (!this.id.length && this.idClient) {
      this.store.dispatch(new RoutineClient()).subscribe(
        () => {
          this.routine = this.store.selectSnapshot(
            ClientsState.getSelectedRoutine,
          );
          if (this.routine) {
            this.routineForm.patchValue(this.routine);
            this.selectedSubroutines = this.routine?.subRoutines || [];
          }
        },
        (error) => {
          console.error('Error al crear rutina', error);
        },
      );
    }
    if (this.routineForm) {
      return;
    }

    this.routineForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      type: [''],
      isGeneral: [false],
      showOnScreen: [false],
      isCustom: [{ value: false, disabled: true }],
    });

    this.routineForm
      .get('isGeneral')
      ?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy)
      )
      .subscribe((isGeneral: boolean) => {
        const typeControl = this.routineForm.get('type');

        if (isGeneral) {
          typeControl?.setValidators(Validators.required);
        } else {
          typeControl?.clearValidators();
          const showOnScreenControl = this.routineForm.get('showOnScreen');
          showOnScreenControl?.setValue(false);
        }
        typeControl?.updateValueAndValidity();

        if (!this.isInitializing) {
          this.updateActiveScreenRoutinesCount();
        }
      });

    this.routineForm
      .get('showOnScreen')
      ?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy)
      )
      .subscribe(() => {
        if (!this.isInitializing) {
          this.updateActiveScreenRoutinesCount();
        }
      });

    // Hacer la primera llamada después de un breve retraso para asegurar que la inicialización esté completa
    setTimeout(() => {
      this.isInitializing = false;
      this.updateActiveScreenRoutinesCount();
    }, 500);
  }

  ngOnChanges(): void {
    if (this.isEdit()) {
      this.title = 'Editar Rutina';
      this.btnTitle = 'Guardar';

      const routine: Routine | null = this.store.selectSnapshot(
        RoutineState.selectedRoutine,
      );
      this.selectedSubroutines = routine?.subRoutines || [];

      if (!this.routineForm) {
              this.routineForm = this.fb.group({
        name: ['', Validators.required],
        description: ['', Validators.required],
        type: ['', Validators.required],
        isGeneral: [false],
        showOnScreen: [false],
        isCustom: [{ value: false, disabled: true }],
      });
      }

      if (routine) this.routineForm.patchValue(routine);
    }
  }

  get isGeneralControl(): boolean {
    return this.routineForm.get('isGeneral')?.value;
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

    const subRoutinesIds = routine?.subRoutines
      ?.map((sub) => sub._id)
      ?.filter((id): id is string => id !== undefined && id !== null) || [];

    const formValue = this.routineForm.getRawValue();
    const payload: RoutinePayload = {
      name: formValue.name,
      description: formValue.description,
      isCustom: formValue.isCustom,
      isGeneral: formValue.isGeneral,
      showOnScreen: formValue.showOnScreen ?? false,
      type: formValue.type,
      subRoutines: subRoutinesIds,
    };
    if (this.isEdit()) {
      if (this.idClient && this.routine?._id) {
        this.store
          .dispatch(
            new UpdateRoutine(
              this.routine._id.toString(),
              payload,
              this.idClient,
            ),
          )
          .subscribe(() => {
            this.snackBarService.showSuccess('Éxito!', 'Rutina actualizada');
            this.location.back();
          });
        return;
      }
      this.store
        .dispatch(new UpdateRoutine(this.id(), payload))
        .subscribe(() => {
          this.snackBarService.showSuccess('Éxito!', 'Rutina actualizada');
          this.location.back();
        });
    } else {
      this.store.dispatch(new CreateRoutine(payload)).subscribe(() => {
        this.snackBarService.showSuccess('Éxito!', 'Rutina creada');
        this.location.back();
      });
    }
  }

  goBack() {
    this.location.back();
  }

  handleList(e: SubRoutine[]) {
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

  get showOnScreenControl(): FormControl {
    return this.routineForm.get('showOnScreen') as FormControl;
  }

  private updateActiveScreenRoutinesCount(): void {
    this.store.dispatch(new GetRoutinesByPage({
      page: 1,
      showOnScreen: true
    })).subscribe(() => {
      const screenRoutines = this.store.selectSnapshot(RoutineState.routines);
      this.activeScreenRoutines = screenRoutines.length;
    });
  }
}
