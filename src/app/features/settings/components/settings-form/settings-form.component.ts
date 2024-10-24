import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputDirective } from '@shared/directives/btn/input.directive';
import { BtnDirective } from '@shared/directives/btn/btn.directive';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { ConditionalTextPipe } from '@shared/pipes/conditional-text.pipe';
import { SettingsState } from '@features/settings/state/settings.state';
import { Observable } from 'rxjs';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { CrateSettings } from '@features/settings/state/settings.actions';
import { SnackBarService } from '@core/services/snackbar.service';

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
export class SettingsFormComponent implements OnInit, OnDestroy {
  settingsForm!: FormGroup;

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

  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    for (let i = 6; i <= 22; i++) {
      this.hoursList.push(i);
    }
    this.settingsForm = this.fb.group({
      days: [null, [Validators.required]],
      hours: [null, [Validators.required]],
      maxCount: [null, [Validators.required]],
    });
  }

  createSettings(): void {
    if (this.settingsForm.valid) {
      this.store.dispatch(new CrateSettings(this.settingsForm.value));
      this.actions.pipe(ofActionSuccessful(CrateSettings)).subscribe(() => {
        this.snackbar.showSuccess('Settings created', 'OK');
      });
    }
  }
}
