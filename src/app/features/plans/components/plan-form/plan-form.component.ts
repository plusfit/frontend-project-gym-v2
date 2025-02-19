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
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { BtnDirective } from '@shared/directives/btn/btn.directive';
import { Observable, Subject } from 'rxjs';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import {
  ExperienceLevel,
  Plan,
  PlanType,
} from '@features/plans/interfaces/plan.interface';
import { CreatePlan, UpdatePlan } from '@features/plans/state/plan.actions';
import { SnackBarService } from '@core/services/snackbar.service';
import { InputComponent } from '@shared/components/input/input.component';
import { TitleComponent } from '@shared/components/title/title.component';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { Routine } from '@features/routines/interfaces/routine.interface';
import { MatSelectModule } from '@angular/material/select';
import { GetRoutinesByName } from '@features/routines/state/routine.actions';
import { RoutineState } from '@features/routines/state/routine.state';
import { MatCheckbox } from '@angular/material/checkbox';
import { AutocompleteComponent } from '@shared/components/autocomplete/autocomplete.component';

@Component({
  selector: 'app-plan-form',
  templateUrl: './plan-form.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    BtnDirective,
    CommonModule,
    InputComponent,
    TitleComponent,
    LoaderComponent,
    MatSelectModule,
    AutocompleteComponent,
    MatCheckbox,
  ],
})
export class PlanFormComponent implements OnInit, OnDestroy, OnChanges {
  isEdit: InputSignal<boolean> = input<boolean>(false);
  id: InputSignal<string> = input<string>('');
  routines: InputSignal<Routine[]> = input<Routine[]>([]);
  selector = RoutineState.routines;
  selectedRoutine: Routine | null = null;
  planForm!: FormGroup;
  plan: Plan | null = null;
  loading$!: Observable<boolean | null>;
  title = 'Crear Plan';
  btnTitle = 'Crear';

  private destroy = new Subject<void>();

  planCategories = [
    { value: 'weightLoss', label: 'Pérdida de peso' },
    { value: 'muscleGain', label: 'Ganar músculo' },
    { value: 'endurance', label: 'Resistencia' },
    { value: 'generalWellness', label: 'Bienestar general' },
    { value: 'flexibility', label: 'Flexibilidad' },
    { value: 'strengthTraining', label: 'Entrenamiento de fuerza' },
  ];

  planGoals = [
    { value: 'loseWeight', label: 'Perder peso' },
    { value: 'buildMuscle', label: 'Ganar músculo' },
    { value: 'improveCardio', label: 'Mejorar cardio' },
    { value: 'increaseFlexibility', label: 'Aumentar flexibilidad' },
    { value: 'generalFitness', label: 'Estado físico general' },
  ];

  experienceLevels = [
    { value: ExperienceLevel.BEGINNER, label: 'Principiante' },
    { value: ExperienceLevel.INTERMEDIATE, label: 'Intermedio' },
    { value: ExperienceLevel.ADVANCED, label: 'Avanzado' },
  ];

  planTypes = [
    { value: PlanType.CARDIO, label: 'Cardio' },
    { value: PlanType.MIXED, label: 'Mixto' },
    { value: PlanType.ROOM, label: 'Sala' },
  ];

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router,
    private location: Location,
    private snackBarService: SnackBarService,
  ) {}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.loading$ = this.store.select((state) => state.plans.loading);
    this.planForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        type: ['', Validators.required],
        category: ['', Validators.required],
        goal: ['', Validators.required],
        experienceLevel: ['', Validators.required],
        minAge: ['', [Validators.min(0), Validators.max(100)]],
        maxAge: ['', [Validators.min(0), Validators.max(100)]],
        includesCoach: [false],
        days: ['', [Validators.required, Validators.min(1), Validators.max(7)]],
        defaultRoutine: ['', [Validators.required]],
      },
      { validators: this.ageRangeValidator },
    );
  }

  ngOnChanges(): void {
    if (this.isEdit()) {
      this.title = 'Editar Plan';
      this.btnTitle = 'Guardar';
      this.plan = this.store.selectSnapshot(
        (state) => state.plans.selectedPlan,
      );
      if (this.plan) {
        this.planForm.patchValue({
          ...this.plan,
          defaultRoutine: this.plan.defaultRoutine.name,
        });
      }
    }
  }

  private ageRangeValidator(group: FormGroup) {
    const minAge = group.get('minAge')?.value;
    const maxAge = group.get('maxAge')?.value;
    return minAge != null && maxAge != null && minAge > maxAge
      ? { ageRangeInvalid: true }
      : null;
  }

  get defaultRoutineControl(): FormControl {
    return this.planForm.get('defaultRoutine') as FormControl;
  }

  getControl(controlName: string): FormControl {
    return this.planForm.get(controlName) as FormControl;
  }

  action(searchTerm: string): GetRoutinesByName {
    return new GetRoutinesByName({ page: 1 }, { name: searchTerm });
  }
  save(): void {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }
    const payload = {
      ...this.planForm.value,
      defaultRoutine: this.selectedRoutine?._id,
    };
    if (this.isEdit()) {
      this.store.dispatch(new UpdatePlan(this.id(), payload)).subscribe(() => {
        this.snackBarService.showSuccess('¡Éxito!', 'Plan actualizado');
        this.location.back();
      });
    } else {
      this.store.dispatch(new CreatePlan(payload)).subscribe(() => {
        this.snackBarService.showSuccess('¡Éxito!', 'Plan creado');
        this.location.back();
      });
    }
  }

  onSelectedRoutine(routine: Routine): void {
    this.selectedRoutine = routine;
  }

  goBack() {
    this.location.back();
  }
}
