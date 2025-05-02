import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import {
  LOCAL_STORAGE_ENGINE,
  NgxsStoragePluginModule,
} from '@ngxs/storage-plugin';
import { NgxsModule } from '@ngxs/store';
import { AuthState } from '@features/auth/state/auth.state';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { errorInterceptor } from '@core/interceptors/error.interceptor';

import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { DEFAULT_DIALOG_CONFIG } from '@angular/cdk/dialog';
import { environment } from '../environments/environment';
import { tokenInterceptor } from '@core/interceptors/token.interceptor';
import { authorizeInterceptor } from '@core/interceptors/authorize.interceptor';
import { ExerciseState } from '@features/exercises/state/exercise.state';
import { SettingsState } from '@features/settings/state/settings.state';
import { RoutineState } from '@features/routines/state/routine.state';
import { SubRoutinesState } from '@features/sub-routines/state/sub-routine.state';
import { ScheduleState } from '@features/schedule/state/schedule.state';
import { ClientsState } from '@features/client/state/clients.state';
import { PlansState } from '@features/plans/state/plan.state';
import { ScreenRoutineState } from '@features/screenRoutine/state/screenRoutine.state';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        tokenInterceptor,
        errorInterceptor,
        authorizeInterceptor,
      ]),
    ),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'project-gym-e5005',
        appId: '1:437288461955:web:cf931e31562c7601059db6',
        storageBucket: 'project-gym-e5005',
        apiKey: 'AIzaSyCa5LaZB6Gscv5V7Du-bH01oBkx0dUBLUo',
        authDomain: 'project-gym-e5005.firebaseapp.com',
        messagingSenderId: '437288461955',
        measurementId: 'G-3GKPHZY9M7',
      }),
    ),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),
    importProvidersFrom(
      NgxsModule.forRoot(
        [
          AuthState,
          SettingsState,
          ExerciseState,
          SubRoutinesState,
          RoutineState,
          ScheduleState,
          ClientsState,
          PlansState,
          ScreenRoutineState,
        ],
        {
          developmentMode: true,
        },
      ),
    ),
    importProvidersFrom(
      NgxsReduxDevtoolsPluginModule.forRoot({
        disabled: environment.production,
      }),
    ),
    importProvidersFrom(
      NgxsStoragePluginModule.forRoot({
        keys: [
          {
            key: AuthState,
            engine: LOCAL_STORAGE_ENGINE,
          },
        ],
      }),
    ),
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        horizontalPosition: 'right',
        verticalPosition: 'top',
        duration: 5000,
      },
    },
    {
      provide: DEFAULT_DIALOG_CONFIG,
      useValue: {
        autoFocus: false,
        backdropClass: ['bg-opacity-75', 'transition-opacity', 'bg-black'],
        hasBackdrop: true,
        panelClass: ['w-full', 'md:w-2/5', 'max-w-2/5', '!m-4'],
      },
    },
  ],
};
