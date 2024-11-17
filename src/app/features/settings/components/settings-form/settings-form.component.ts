import { AsyncPipe, JsonPipe } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { SnackBarService } from '@core/services/snackbar.service';
import { SettingsUpdate } from '@features/settings/interfaces/settings.interface';
import {
  CrateSettings,
  UpdateSettings,
} from '@features/settings/state/settings.actions';
import { SettingsState } from '@features/settings/state/settings.state';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { BtnDirective } from '@shared/directives/btn/btn.directive';
import { InputDirective } from '@shared/directives/btn/input.directive';
import { ConditionalTextPipe } from '@shared/pipes/conditional-text.pipe';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-settings-form',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    InputDirective,
    BtnDirective,
    JsonPipe,
    AsyncPipe,
    ConditionalTextPipe,
  ],
  templateUrl: './settings-form.component.html',
  styleUrl: './settings-form.component.css',
})
export class SettingsFormComponent implements OnInit, OnDestroy, OnChanges {
  settingsForm!: FormGroup;
  @Input() settings!: any;
  private destroy = new Subject<void>();

  loading$: Observable<boolean> = this.store.select(
    SettingsState.settingsLoading,
  );
  days = new FormControl('');
  hoursList: number[] = [];

  daysList: string[] = [
    'Lunes',
    'Martes',
    'Miercoles',
    'Jueves',
    'Viernes',
    'Sabado',
  ];

  constructor(
    private fb: FormBuilder,
    // private router: Router,
    private store: Store,
    private actions: Actions,
    private snackbar: SnackBarService,
  ) {}

  ngOnInit(): void {
    console.log('Settings', this.settings);

    for (let i = 6; i <= 22; i++) {
      this.hoursList.push(i);
    }
    // Configura el formulario correctamente con `days` como un FormArray
    this.settingsForm = this.fb.group({
      days: this.fb.control([], [Validators.required]), // FormArray
      hours: this.fb.control([], [Validators.required]),
      maxCount: this.fb.control('', [Validators.required]),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['settings'] && this.settings) {
      // Establece el valor de `days` usando `daysArray` que llega como entrada
      this.settingsForm
        ?.get('days')
        ?.patchValue(this.settings?.schedule?.map((day: any) => day.day));

      // Establece el valor de `hours` con las horas recibidas
      const hoursArray = this.settings?.schedule?.flatMap(
        (day: any) => day.hours,
      ); // Combina todas las horas de los días
      this.settingsForm.get('hours')?.patchValue(hoursArray);
      console.log('Settings', this.settings);

      // Establece el valor de `maxCount` con el valor recibido
      this.settingsForm
        .get('maxCount')
        ?.patchValue(this.settings?.schedule[0]?.maxCount);
    }
  }

  // Getter para obtener el FormArray `days`
  get daysArray() {
    const days = this.settingsForm?.get('days') as FormArray;
    console.log('Days', days.controls);
    return days.controls;
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  createSettings(): void {
    if (this.settingsForm.valid && !this.settings) {
      this.store.dispatch(new CrateSettings(this.settingsForm.value));
      this.actions.pipe(ofActionSuccessful(CrateSettings)).subscribe(() => {
        this.snackbar.showSuccess('Settings created', 'OK');
      });
    } else if (this.settingsForm.valid) {
      const _id = this.settings._id;
      const dataSend: SettingsUpdate = {
        schedule: this.settingsForm.get('days')?.value.map((day: any) => {
          return {
            day: day, // Si `day` es un string, úsalo directamente; si es un objeto, usa `day.day`.
            hours: day.hours
              ? [...new Set(day.hours)] // Asegura que no haya duplicados si `hours` ya existe.
              : [...new Set(this.settingsForm.get('hours')?.value)], // Obtén los valores de `hours` del formulario sin duplicados.
            maxCount: day.maxCount || this.settingsForm.get('maxCount')?.value, // Configura el `maxCount` del día actual o del formulario.
          };
        }),
      };
      console.log('DataSend', dataSend);
      this.store.dispatch(new UpdateSettings(_id, dataSend));
      this.actions.pipe(ofActionSuccessful(UpdateSettings)).subscribe(() => {
        this.snackbar.showSuccess('Settings updated', 'OK');
      });
    }
  }
}
