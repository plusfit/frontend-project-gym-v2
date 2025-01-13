import { Component, OnDestroy, OnInit } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject, takeUntil } from 'rxjs';
import { InputComponent } from '../../../../shared/components/input/input.component';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Register } from '@features/auth/state/auth.actions';
import { passwordValidator } from '@core/validators/password.validator';

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
      cardiacHistoryInput: [''],
      bloodPressure: ['', [Validators.required]],
      frequencyOfPhysicalExercise: ['', [Validators.required]],
      respiratoryHistory: ['', [Validators.required]],
      respiratoryHistoryInput: [''],
    });
  }

  registerClient() {
    if (this.clientForm.valid) {
      const dataRegister = {
        identifier: this.clientForm.get('identifier')?.value,
        password: this.clientForm.get('password')?.value,
      };
      this.store.dispatch(new Register(dataRegister));
      this.actions
        .pipe(ofActionSuccessful(Register), takeUntil(this._destroyed))
        .subscribe((res) => {
          console.log(res);
          const _id = this.store.selectSnapshot((state) => state.auth.auth);
          console.log('id', _id);

          console.log('Registro exitoso');
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
