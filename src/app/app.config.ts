import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
// import { withNgxsLoggerPlugin } from '@ngxs/logger-plugin';
import {
  NgxsStoragePluginModule,
  SESSION_STORAGE_ENGINE,
  // withNgxsStoragePlugin,
} from '@ngxs/storage-plugin';
import { NgxsModule } from '@ngxs/store';
import { AuthState } from '@features/auth/state/auth.state';
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'project-gym-e5005',
        appId: '1:437288461955:web:cf931e31562c7601059db6',
        storageBucket: 'project-gym-e5005.appspot.com',
        apiKey: 'AIzaSyCa5LaZB6Gscv5V7Du-bH01oBkx0dUBLUo',
        authDomain: 'project-gym-e5005.firebaseapp.com',
        messagingSenderId: '437288461955',
        measurementId: 'G-3GKPHZY9M7',
      }),
    ),
    provideAuth(() => getAuth()),
    importProvidersFrom(
      NgxsModule.forRoot(
        [
          /* your state classes here */
          AuthState,
        ],
        {
          developmentMode: true,
        },
      ),
    ),
    importProvidersFrom(NgxsReduxDevtoolsPluginModule.forRoot()),
    importProvidersFrom(
      NgxsStoragePluginModule.forRoot({
        keys: [
          {
            key: AuthState,
            engine: SESSION_STORAGE_ENGINE,
          },
        ],
      }),
    ),
  ],
};
