import { AsyncPipe, Location } from '@angular/common';
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
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { SnackBarService } from '@core/services/snackbar.service';
import { passwordValidator } from '@core/validators/password.validator';
import {
  RegisterClient,
  UpdateClient,
} from '@features/client/state/clients.actions';
import { ClientsState } from '@features/client/state/clients.state';
import {
  AssignPlanToUser,
  GetPlan,
  GetPlans,
} from '@features/plans/state/plan.actions';
import { PlansState } from '@features/plans/state/plan.state';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { AutocompleteComponent } from '../../../../shared/components/autocomplete/autocomplete.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { BtnDirective } from '@shared/directives/btn/btn.directive';
import { Client } from '@features/client/interface/clients.interface';

@Component({
  selector: 'app-client-form',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    InputComponent,
    ReactiveFormsModule,
    MatSelectModule,
    MatRadioModule,
    AutocompleteComponent,
    AsyncPipe,
    BtnDirective,
  ],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.css',
})
export class ClientFormComponent implements OnDestroy, OnInit, OnChanges {
  isEdit: InputSignal<boolean> = input<boolean>(false);
  id: InputSignal<string> = input<string>('');
  clientForm!: FormGroup;
  selector = PlansState.getPlans;
  selectedPlanId: string | null = null;
  dataClient: InputSignal<any> = input<any>({});
  clientData: Client | null = null;
  initialPlan: any = null;

  loading$ = this.store.select(PlansState.isLoading);
  loadingClient$ = this.store.select(ClientsState.isLoading);

  sexs: any[] = [
    { value: 'Masculino', viewValue: 'Masculino' },
    { value: 'Femenino', viewValue: 'Femenino' },
    { value: 'otros', viewValue: 'otros' },
  ];

  bloodPressures: any[] = [
    { value: 'Alta', viewValue: 'Alta' },
    { value: 'Baja', viewValue: 'Baja' },
  ];
  frequencyOfPhysicalExercise: any[] = [
    { value: 'Diario', viewValue: 'Diario' },
    { value: 'Moderado', viewValue: 'Moderado' },
    { value: 'Ninguno', viewValue: 'Ninguno' },
  ];

  private _destroyed = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private router: Router,
    private store: Store,
    private actions: Actions,
    private snackbar: SnackBarService,
  ) {}

  ngOnInit(): void {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required]],
      identifier: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordValidator()]],
      phone: ['', [Validators.required]],
      dateBirthday: ['', [Validators.required]],
      address: ['', [Validators.required]],
      medicalSociety: ['', [Validators.required]],
      sex: ['', [Validators.required]],
      cardiacHistory: ['', [Validators.required]],
      surgicalHistory: ['', [Validators.required]],
      historyofPathologicalLesions: ['', [Validators.required]],
      bloodPressure: ['', [Validators.required]],
      frequencyOfPhysicalExercise: ['', [Validators.required]],
      respiratoryHistory: ['', [Validators.required]],
      plan: ['', [Validators.required]],
      CI: ['', [Validators.required]],
    });
  }

  ngOnChanges(): void {
    if (this.isEdit()) {
      this.clientData = this.store.selectSnapshot(
        (state) => state.clients.selectedClient,
      );
      if (this.clientData) {
        this.clientForm.patchValue({
          ...this.clientData,
        });
      }

      this.store.dispatch(new GetPlan(this.clientData?.planId ?? ''));
      this.actions
        .pipe(
          ofActionSuccessful(GetPlan), // Detecta cuando GetPlan se ejecuta correctamente
          takeUntil(this._destroyed), // Asegura la limpieza cuando el componente se destruya
          switchMap(
            () => this.store.selectOnce(PlansState.getSelectedPlan), // Obtiene el estado actualizado una vez
          ),
        )
        .subscribe((plan) => {
          this.initialPlan = plan; // Verifica que tengas los datos correctos
        });
    }
  }

  registerClient() {
    if (this.clientForm.valid) {
      const userInfo = {
        name: this.clientForm.get('name')?.value,
        password: this.clientForm.get('password')?.value,
        phone: this.clientForm.get('phone')?.value,
        identifier: this.clientForm.get('identifier')?.value,
        address: this.clientForm.get('address')?.value,
        dateBirthday: this.clientForm.get('dateBirthday')?.value,
        medicalSociety: this.clientForm.get('medicalSociety')?.value,
        sex: this.clientForm.get('sex')?.value,
        cardiacHistory: this.clientForm.get('cardiacHistory')?.value,
        surgicalHistory: this.clientForm.get('surgicalHistory')?.value,
        historyofPathologicalLesions: this.clientForm.get(
          'historyofPathologicalLesions',
        )?.value,
        bloodPressure: this.clientForm.get('bloodPressure')?.value,
        frequencyOfPhysicalExercise: this.clientForm.get(
          'frequencyOfPhysicalExercise',
        )?.value,
        CI: this.clientForm.get('CI')?.value,
        respiratoryHistory: this.clientForm.get('respiratoryHistory')?.value,
      };
      if (this.isEdit()) {
        this.store.dispatch(new UpdateClient(this.id(), userInfo));
        this.actions
          .pipe(ofActionSuccessful(UpdateClient), takeUntil(this._destroyed))
          .subscribe(() => {
            if (this.initialPlan || this.selectedPlanId) {
              this.store.dispatch(
                new AssignPlanToUser(
                  this.selectedPlanId ?? this.initialPlan._id,
                  this.id(),
                ),
              );
              this.actions
                .pipe(
                  ofActionSuccessful(AssignPlanToUser),
                  takeUntil(this._destroyed),
                )
                .subscribe(() => {
                  this.snackbar.showSuccess(
                    'Exito',
                    'Cliente actualizado con correctamente',
                  );
                  this.clientForm.reset();
                });
            }
          });
      } else {
        const dataRegister = {
          identifier: this.clientForm.get('identifier')?.value,
          password: this.clientForm.get('password')?.value,
        };
        this.store.dispatch(new RegisterClient(dataRegister));
        this.actions
          .pipe(ofActionSuccessful(RegisterClient), takeUntil(this._destroyed))
          .subscribe(() => {
            const registerClient = this.store.selectSnapshot(
              ClientsState.getRegisterClient,
            );
            this.store.dispatch(new UpdateClient(registerClient._id, userInfo));
            this.actions
              .pipe(
                ofActionSuccessful(UpdateClient),
                takeUntil(this._destroyed),
              )
              .subscribe(() => {
                if (this.selectedPlanId) {
                  this.store.dispatch(
                    new AssignPlanToUser(
                      this.selectedPlanId,
                      registerClient._id,
                    ),
                  );
                  this.actions
                    .pipe(
                      ofActionSuccessful(AssignPlanToUser),
                      takeUntil(this._destroyed),
                    )
                    .subscribe(() => {
                      this.snackbar.showSuccess(
                        'Exito',
                        'Cliente registrado con correctamente',
                      );
                      this.clientForm.reset();
                    });
                }
              });
          });
      }
    }
  }

  action(searchTerm: string): GetPlans {
    return new GetPlans({ page: 1, pageSize: 10, searchQ: searchTerm });
  }

  onPlanSelected(plan: any): void {
    this.selectedPlanId = plan._id;
  }

  cancel() {
    this.location.back();
  }

  get nameControl(): FormControl {
    return this.clientForm.get('name') as FormControl;
  }
  get identifierControl(): FormControl {
    return this.clientForm.get('identifier') as FormControl;
  }

  get CIControl(): FormControl {
    return this.clientForm.get('CI') as FormControl;
  }

  get passwordControl(): FormControl {
    return this.clientForm.get('password') as FormControl;
  }
  get addressControl(): FormControl {
    return this.clientForm.get('address') as FormControl;
  }
  get medicalSocietyControl(): FormControl {
    return this.clientForm.get('medicalSociety') as FormControl;
  }
  get cardiacHistoryControl(): FormControl {
    return this.clientForm.get('cardiacHistory') as FormControl;
  }

  get respiratoryHistoryInputControl(): FormControl {
    return this.clientForm.get('respiratoryHistoryInput') as FormControl;
  }
  get bloodPressureControl(): FormControl {
    return this.clientForm.get('bloodPressure') as FormControl;
  }
  get respiratoryHistoryControl(): FormControl {
    return this.clientForm.get('respiratoryHistory') as FormControl;
  }

  get cardiacHistoryInputControl(): FormControl {
    return this.clientForm.get('cardiacHistoryInput') as FormControl;
  }

  get phoneControl(): FormControl {
    return this.clientForm.get('phone') as FormControl;
  }

  get planControl(): FormControl {
    return this.clientForm.get('plan') as FormControl;
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }
}
