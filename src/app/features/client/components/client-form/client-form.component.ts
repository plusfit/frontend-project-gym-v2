import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { passwordValidator } from '@core/validators/password.validator';
import {
  RegisterClient,
  UpdateClient,
} from '@features/client/state/clients.actions';
import { ClientsState } from '@features/client/state/clients.state';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Subject, takeUntil } from 'rxjs';
import { InputComponent } from '../../../../shared/components/input/input.component';

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
  ],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.css',
})
export class ClientFormComponent implements OnDestroy, OnInit {
  clientForm!: FormGroup;

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
    });
  }

  registerClient() {
    if (this.clientForm.valid) {
      const dataRegister = {
        identifier: this.clientForm.get('identifier')?.value,
        password: this.clientForm.get('password')?.value,
      };
      this.store.dispatch(new RegisterClient(dataRegister));
      const userInfo = {
        name: this.clientForm.get('name')?.value,
        phone: this.clientForm.get('phone')?.value,
        email: this.clientForm.get('identifier')?.value,
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
        respiratoryHistory: this.clientForm.get('respiratoryHistory')?.value,
      };
      this.actions
        .pipe(ofActionSuccessful(RegisterClient), takeUntil(this._destroyed))
        .subscribe(() => {
          const registerClient = this.store.selectSnapshot(
            ClientsState.getRegisterClient,
          );
          console.log(registerClient._id);
          this.store.dispatch(new UpdateClient(registerClient._id, userInfo));
          this.actions
            .pipe(ofActionSuccessful(UpdateClient), takeUntil(this._destroyed))
            .subscribe((res) => {
              console.log('response', res);
            });
        });
    }
    console.log(this.clientForm.value);
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

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }
}
