import {
  Component,
  input,
  InputSignal,
  OnDestroy,
  OnInit,
  OnChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BtnDirective } from '@shared/directives/btn/btn.directive';
import { Observable, Subject } from 'rxjs';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Plan } from '@features/plans/interfaces/plan.interface';
import { CreatePlan, UpdatePlan } from '@features/plans/state/plan.actions';
import { SnackBarService } from '@core/services/snackbar.service';
import { InputComponent } from '@shared/components/input/input.component';
import { MatDivider } from '@angular/material/divider';
import { TitleComponent } from '@shared/components/title/title.component';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { Routine } from '@features/routines/interfaces/routine.interface';
import { RoutineAutocompleteComponent } from '@features/plans/components/routine-autocomplete/routine-autocomplete.component';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-plan-form',
  templateUrl: './plan-form.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    BtnDirective,
    CommonModule,
    InputComponent,
    MatDivider,
    TitleComponent,
    LoaderComponent,
    RoutineAutocompleteComponent,
    MatSelectModule,
  ],
})
export class PlanFormComponent implements OnInit, OnDestroy, OnChanges {
  isEdit: InputSignal<boolean> = input<boolean>(false);
  id: InputSignal<string> = input<string>('');
  routines: InputSignal<Routine[]> = input<Routine[]>([]);
  selectedRoutine: Routine | null = null;
  planForm!: FormGroup;
  plan: Plan | null = null;
  loading$!: Observable<boolean | null>;
  title = 'Crear Plan';
  btnTitle = 'Crear';

  private destroy = new Subject<void>();

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
    this.planForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      days: ['', [Validators.required, Validators.min(1), Validators.max(7)]],
      defaultRoutine: ['', Validators.required],
    });
  }

  get nameControl(): FormControl {
    return this.planForm.get('name') as FormControl;
  }

  get typeControl(): FormControl {
    return this.planForm.get('type') as FormControl;
  }

  get daysControl(): FormControl {
    return this.planForm.get('days') as FormControl;
  }

  get defaultRoutineControl(): FormControl {
    return this.planForm.get('defaultRoutine') as FormControl;
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
        this.snackBarService.showSuccess('Éxito!', 'Plan actualizado');
        this.location.back();
      });
    } else {
      this.store.dispatch(new CreatePlan(payload)).subscribe(() => {
        this.snackBarService.showSuccess('Éxito!', 'Plan creado');
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
