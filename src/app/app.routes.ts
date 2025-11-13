import { Routes } from "@angular/router";
import { DashboardLayoutComponent } from "@core/components/dashboard-layout/dashboard-layout.component";
import { authGuard } from "@core/guards/auth.guards";
import { signInGuard } from "@core/guards/sign-in.guards";
import { AuthLayoutComponent } from "@features/auth/components/auth-layout/auth-layout.component";
import { LoginPageComponent } from "@features/auth/pages/login-page/login-page.component";
import { RegisterPageComponent } from "@features/auth/pages/register-page/register-page.component";
import { SchedulePageComponent } from "@features/schedule/pages/schedule-page/schedule-page.component";
import { ExerciseComponent } from "@features/exercises/pages/exercise/exercise.component";
import { AddEditRoutinePageComponent } from "@features/routines/pages/add-edit-page/add-edit-routine.page.component";
import { RoutinePageComponent } from "@features/routines/pages/routine/routine.component";
import { SettingsPagesComponent } from "@features/settings/pages/settings-pages/settings-pages.component";
import { PageNotFoundComponent } from "@shared/components/page-not-found/page-not-found.component";
import { WelcomeComponent } from "@core/components/welcome/welcome.component";
import { SubRoutinePageComponent } from "@features/sub-routines/pages/sub-routine-page/sub-routine-page.component";
import { AddEditSubRoutineComponent } from "@features/sub-routines/pages/add-edit-sub-routine/add-edit-sub-routine.component";
import { PlansPageComponent } from "@features/plans/pages/plans-page/plans-page.component";
import { AddEditPlanComponent } from "@features/plans/pages/add-edit-plan/add-edit-plan.component";
import { ForgotPasswordPageComponent } from "@features/auth/pages/forgot-password-page/forgot-password-page.component";
import { ClientPageComponent } from "@features/client/pages/client-page/client-page.component";
import { AddClientPageComponent } from "@features/client/pages/add-client-page/add-client-page.component";
import { AddEditClientPageComponent } from "@features/client/pages/add-edit-client-page/add-edit-client-page.component";
import { DetailClientComponent } from "@features/client/pages/detail-client/detail-client.component";
import { ScreenPagesComponent } from "@features/screenRoutine/pages/screen-pages/screen-pages.component";
import { SpecialAccessPageComponent } from "@features/special-access/pages/special-access-page/special-access-page.component";
import { GymAccessPageComponent } from "@features/gym-access/pages/gym-access-page/gym-access-page.component";
import { PaymentsPageComponent } from "@features/payments/pages/payments-page/payments-page.component";

export const routes: Routes = [
  {
    path: "",
    component: DashboardLayoutComponent,
    canActivate: [signInGuard],
    children: [
      {
        path: "",
        component: WelcomeComponent,
      },
      {
        path: "subrutinas",
        component: SubRoutinePageComponent,
      },
      {
        path: "subrutinas/:id",
        component: AddEditSubRoutineComponent,
      },
      {
        path: "subrutinas/crear",
        component: AddEditSubRoutineComponent,
      },
      {
        path: "ejercicios",
        component: ExerciseComponent,
      },
      {
        path: "rutinas/crear",
        component: AddEditRoutinePageComponent,
      },
      {
        path: "rutinas/:id",
        component: AddEditRoutinePageComponent,
      },
      {
        path: "configuracion",
        component: SettingsPagesComponent,
      },
      {
        path: "rutinas",
        component: RoutinePageComponent,
      },
      {
        path: "horarios",
        component: SchedulePageComponent,
      },
      {
        path: "clientes",
        component: ClientPageComponent,
      },
      {
        path: "clientes/crear",
        component: AddClientPageComponent,
      },
      {
        path: "clientes/:id",
        component: AddEditClientPageComponent,
      },
      {
        path: "clientes/detalle/:id",
        component: DetailClientComponent,
      },
      {
        path: "planes",
        component: PlansPageComponent,
      },
      {
        path: "planes/:id",
        component: AddEditPlanComponent,
      },
      {
        path: "planes/crear",
        component: AddEditPlanComponent,
      },
      {
        path: "historial-accesos",
        component: GymAccessPageComponent,
      },
      {
        path: "pagos",
        component: PaymentsPageComponent,
      },
      {
        path: "rewards",
        loadChildren: () => import('./features/rewards/rewards.module').then(m => m.RewardsModule)
      },
    ],
  },
  {
    path: "pantalla",
    component: ScreenPagesComponent,
    canActivate: [signInGuard], // 🔐 Protege la ruta con el guard
  },
  {
    path: "acceso-especial",
    component: SpecialAccessPageComponent,
    canActivate: [signInGuard], // 🔐 Protege la ruta con el guard
  },
  {
    path: "auth",
    component: AuthLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: "login",
        component: LoginPageComponent,
      },
      {
        path: "register",
        component: RegisterPageComponent,
      },
      {
        path: "forgot-password",
        component: ForgotPasswordPageComponent,
      },
    ],
  },
  {
    path: "**",
    component: PageNotFoundComponent,
    pathMatch: "full",
  },
];
