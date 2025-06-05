import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '@core/components/dashboard-layout/dashboard-layout.component';
import { authGuard } from '@core/guards/auth.guards';
import { signInGuard } from '@core/guards/sign-in.guards';
import { RoleGuard } from '@core/guards/role.guard';
import { PermissionsGuard } from '@core/guards/permissions.guard';
import { UserRole } from '@core/enums/roles.enum';
import { Permission, Module } from '@core/enums/permissions.enum';
import { AuthLayoutComponent } from '@features/auth/components/auth-layout/auth-layout.component';
import { LoginPageComponent } from '@features/auth/pages/login-page/login-page.component';
import { RegisterPageComponent } from '@features/auth/pages/register-page/register-page.component';
import { SchedulePageComponent } from '@features/schedule/pages/schedule-page/schedule-page.component';
import { ExerciseComponent } from '@features/exercises/pages/exercise/exercise.component';
import { AddEditRoutinePageComponent } from '@features/routines/pages/add-edit-page/add-edit-routine.page.component';
import { RoutinePageComponent } from '@features/routines/pages/routine/routine.component';
import { SettingsPagesComponent } from '@features/settings/pages/settings-pages/settings-pages.component';
import { PageNotFoundComponent } from '@shared/components/page-not-found/page-not-found.component';
import { WelcomeComponent } from '@core/components/welcome/welcome.component';
import { SubRoutinePageComponent } from '@features/sub-routines/pages/sub-routine-page/sub-routine-page.component';
import { AddEditSubRoutineComponent } from '@features/sub-routines/pages/add-edit-sub-routine/add-edit-sub-routine.component';
import { PlansPageComponent } from '@features/plans/pages/plans-page/plans-page.component';
import { AddEditPlanComponent } from '@features/plans/pages/add-edit-plan/add-edit-plan.component';
import { ForgotPasswordPageComponent } from '@features/auth/pages/forgot-password-page/forgot-password-page.component';
import { ClientPageComponent } from '@features/client/pages/client-page/client-page.component';
import { AddClientPageComponent } from '@features/client/pages/add-client-page/add-client-page.component';
import { AddEditClientPageComponent } from '@features/client/pages/add-edit-client-page/add-edit-client-page.component';
import { DetailClientComponent } from '@features/client/pages/detail-client/detail-client.component';
import { ScreenPagesComponent } from '@features/screenRoutine/pages/screen-pages/screen-pages.component';
import { OrganizationsPageComponent } from '@features/organizations/pages/organizations-page/organizations-page.component';
import { OrganizationDetailPageComponent } from '@features/organizations/pages/organization-detail-page/organization-detail-page.component';
import { ReportsDashboardComponent } from '@features/reports/pages/reports-dashboard/reports-dashboard.component';
import { UnauthorizedComponent } from '@shared/components/unauthorized/unauthorized.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    // canActivate: [signInGuard],
    children: [
      {
        path: '',
        component: WelcomeComponent,
      },
      {
        path: 'subrutinas',
        component: SubRoutinePageComponent,
        canActivate: [PermissionsGuard],
        data: {
          module: Module.ROUTINES,
          permissions: [Permission.ROUTINE_READ],
        },
      },
      {
        path: 'subrutinas/:id',
        component: AddEditSubRoutineComponent,
        canActivate: [PermissionsGuard],
        data: {
          module: Module.ROUTINES,
          permissions: [Permission.ROUTINE_UPDATE],
        },
      },
      {
        path: 'subrutinas/crear',
        component: AddEditSubRoutineComponent,
        canActivate: [PermissionsGuard],
        data: {
          module: Module.ROUTINES,
          permissions: [Permission.ROUTINE_CREATE],
        },
      },
      {
        path: 'ejercicios',
        component: ExerciseComponent,
        canActivate: [PermissionsGuard],
        data: {
          module: Module.EXERCISES,
          permissions: [Permission.EXERCISE_READ],
        },
      },
      {
        path: 'rutinas/crear',
        component: AddEditRoutinePageComponent,
        canActivate: [PermissionsGuard],
        data: {
          module: Module.ROUTINES,
          permissions: [Permission.ROUTINE_CREATE],
        },
      },
      {
        path: 'rutinas/:id',
        component: AddEditRoutinePageComponent,
        canActivate: [PermissionsGuard],
        data: {
          module: Module.ROUTINES,
          permissions: [Permission.ROUTINE_UPDATE],
        },
      },
      {
        path: 'configuracion',
        component: SettingsPagesComponent,
      },
      {
        path: 'reportes',
        component: ReportsDashboardComponent,
        canActivate: [PermissionsGuard],
        data: {
          module: Module.REPORTS,
          permissions: [Permission.REPORTS_VIEW],
        },
      },
      {
        path: 'rutinas',
        component: RoutinePageComponent,
        canActivate: [PermissionsGuard],
        data: {
          module: Module.ROUTINES,
          permissions: [Permission.ROUTINE_READ],
        },
      },
      {
        path: 'horarios',
        component: SchedulePageComponent,
        canActivate: [PermissionsGuard],
        data: {
          module: Module.SCHEDULES,
          permissions: [Permission.SCHEDULE_READ],
        },
      },
      {
        path: 'clientes',
        component: ClientPageComponent,
        canActivate: [PermissionsGuard],
        data: {
          module: Module.CLIENTS,
          permissions: [Permission.CLIENT_READ],
        },
      },
      {
        path: 'clientes/crear',
        component: AddClientPageComponent,
        canActivate: [PermissionsGuard],
        data: {
          module: Module.CLIENTS,
          permissions: [Permission.CLIENT_CREATE],
        },
      },
      {
        path: 'clientes/:id',
        component: AddEditClientPageComponent,
        canActivate: [PermissionsGuard],
        data: {
          module: Module.CLIENTS,
          permissions: [Permission.CLIENT_UPDATE],
        },
      },
      {
        path: 'clientes/detalle/:id',
        component: DetailClientComponent,
        canActivate: [PermissionsGuard],
        data: {
          module: Module.CLIENTS,
          permissions: [Permission.CLIENT_READ],
        },
      },
      {
        path: 'planes',
        component: PlansPageComponent,
        canActivate: [PermissionsGuard],
        data: {
          module: Module.PLANS,
          permissions: [Permission.PLAN_READ],
        },
      },
      {
        path: 'planes/:id',
        component: AddEditPlanComponent,
        canActivate: [PermissionsGuard],
        data: {
          module: Module.PLANS,
          permissions: [Permission.PLAN_UPDATE],
        },
      },
      {
        path: 'planes/crear',
        component: AddEditPlanComponent,
        canActivate: [PermissionsGuard],
        data: {
          module: Module.PLANS,
          permissions: [Permission.PLAN_CREATE],
        },
      },
      {
        path: 'organizaciones',
        component: OrganizationsPageComponent,
        // canActivate: [RoleGuard],
        // data: { roles: [UserRole.SUPER_ADMIN] },
      },
      {
        path: 'organizaciones/detalle/:id',
        component: OrganizationDetailPageComponent,
        // canActivate: [RoleGuard],
        // data: { roles: [UserRole.SUPER_ADMIN] },
      },
    ],
  },
  {
    path: 'pantalla',
    component: ScreenPagesComponent,
    canActivate: [signInGuard], // 🔐 Protege la ruta con el guard
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
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
      {
        path: 'forgot-password',
        component: ForgotPasswordPageComponent,
      },
    ],
  },
  {
    path: '**',
    component: PageNotFoundComponent,
    pathMatch: 'full',
  },
];
