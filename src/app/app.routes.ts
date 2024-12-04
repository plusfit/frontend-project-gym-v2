import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '@core/components/dashboard-layout/dashboard-layout.component';
import { authGuard } from '@core/guards/auth.guards';
import { signInGuard } from '@core/guards/sign-in.guards';
import { AuthLayoutComponent } from '@features/auth/components/auth-layout/auth-layout.component';
import { LoginPageComponent } from '@features/auth/pages/login-page/login-page.component';
import { RegisterPageComponent } from '@features/auth/pages/register-page/register-page.component';
import { SchedulePageComponent } from '@features/schedule/pages/schedule-page/schedule-page.component';
import { ExerciseComponent } from '@features/exercises/pages/exercise/exercise.component';
import { SettingsPagesComponent } from '@features/settings/pages/settings-pages/settings-pages.component';
import { PageNotFoundComponent } from '@shared/components/page-not-found/page-not-found.component';
import { WelcomeComponent } from '@core/components/welcome/welcome.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [signInGuard],
    children: [
      {
        path: '',
        component: WelcomeComponent,
      },
      {
        path: 'exercises/list',
        component: ExerciseComponent,
      },
      {
        path: 'settings',
        component: SettingsPagesComponent,
      },
      {
        path: 'horarios',
        component: SchedulePageComponent,
      },
    ],
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'login',
        component: LoginPageComponent,
      },
      {
        path: 'register',
        component: RegisterPageComponent,
      },
    ],
  },
  {
    path: '**',
    component: PageNotFoundComponent,
    pathMatch: 'full',
  },
];
