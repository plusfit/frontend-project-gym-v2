import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { pickProperties } from '@core/utilities/helpers';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Observable, catchError, tap, throwError, exhaustMap } from 'rxjs';
import {
  AuthResponse,
  FirebaseAuthResponse,
  Profile,
  UserPreferences,
  Permission,
} from '../interfaces/auth';
import { AuthService } from '../services/auth.service';
import {
  ForgotPassword,
  GetNewToken,
  GetUserPreferences,
  Login,
  Logout,
  SetOrganization,
} from './auth.actions';
import { AuthStateModel } from './auth.model';
import { UtilsService } from '@core/services/utils.service';
import { SnackBarService } from '@core/services/snackbar.service';
import { UserRole } from '@core/enums/roles.enum';

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    auth: null,
    loading: false,
    preferences: null,
    organization: null,
  },
})
@Injectable({ providedIn: 'root' })
export class AuthState {
  @Selector()
  static authLoading(state: AuthStateModel): boolean {
    return state.loading || false;
  }

  @Selector()
  static accessToken(state: AuthStateModel): string | undefined {
    return state.auth?.accessToken;
  }

  @Selector()
  static refreshToken(state: AuthStateModel): string | undefined {
    return state.auth?.refreshToken;
  }

  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return !!state.auth?.accessToken;
  }

  @Selector()
  static organization(state: AuthStateModel): any {
    return state.organization || state.auth?.organization;
  }

  @Selector()
  static organizationSlug(state: AuthStateModel): string | undefined {
    console.log('🔍 DEBUG - organizationSlug selector called with state:', {
      'state.organization': state.organization,
      'state.auth': state.auth,
      'state.preferences': state.preferences,
      'state.organization is undefined?': state.organization === undefined,
      'state.auth?.organization': state.auth?.organization,
      'state.preferences?.organizationSlug':
        state.preferences?.organizationSlug,
    });

    // Cambiar el orden de prioridad para usar preferences como fallback principal
    const result =
      state.organization?.slug ||
      state.auth?.organization?.slug ||
      state.preferences?.organizationSlug;

    console.log('🔍 DEBUG - organizationSlug result:', result);

    return result;
  }

  @Selector()
  static userId(state: AuthStateModel): string | undefined {
    return state.preferences?.id;
  }

  @Selector()
  static userNeedsOnboarding(state: AuthStateModel): boolean | undefined {
    return state.preferences?.needOnboarding;
  }

  @Selector()
  static userData(state: AuthStateModel): Profile | undefined {
    const preferences = state.preferences;
    if (!preferences) return undefined;

    const userData = {
      firstName: preferences.firstName,
      lastName: preferences.lastName,
      email: preferences.email,
      role: preferences.role?.toString() || '',
    };

    return userData;
  }

  @Selector()
  static userPermissions(state: AuthStateModel): Permission[] {
    return state.preferences?.permissions || [];
  }

  constructor(
    private authService: AuthService,
    private utilsService: UtilsService,
    private snackbar: SnackBarService,
  ) {}

  @Action(Login, { cancelUncompleted: true })
  login(
    ctx: StateContext<AuthStateModel>,
    action: Login,
  ): Observable<AuthResponse> {
    console.log(
      '🔍 DEBUG - Login action started, current state:',
      ctx.getState(),
    );
    ctx.patchState({ loading: true });
    return this.authService.loginFirebase(action.payload).pipe(
      exhaustMap((response: FirebaseAuthResponse) => {
        return this.authService.login(response._tokenResponse.idToken).pipe(
          tap((authResponse: any) => {
            const { accessToken, refreshToken, organization } =
              authResponse.data;

            console.log('🔍 DEBUG - Login response received:', {
              accessToken: accessToken ? 'present' : 'missing',
              refreshToken: refreshToken ? 'present' : 'missing',
              organization,
            });

            const newState = {
              auth: {
                accessToken,
                refreshToken,
                organization,
              },
              organization,
            };

            console.log('🔍 DEBUG - Updating state in Login with:', newState);

            ctx.patchState(newState);

            console.log('🔍 DEBUG - State after Login update:', ctx.getState());
          }),
        );
      }),
      tap(() => {
        ctx.patchState({ loading: false });
        console.log('🔍 DEBUG - Login completed, final state:', ctx.getState());
      }),
      catchError((err: HttpErrorResponse) => {
        ctx.patchState({ loading: false });
        this.snackbar.showError(
          'Login Erroneo',
          err.error?.data?.message ?? err.message,
        );
        return throwError(() => err);
      }),
    );
  }

  @Action(GetUserPreferences, { cancelUncompleted: true })
  getUserPreferences(
    ctx: StateContext<AuthStateModel>,
  ): Observable<UserPreferences> {
    ctx.patchState({ preferences: null });
    const accessToken = ctx.getState().auth?.accessToken;
    if (!accessToken) {
      return throwError(() => new Error('No hay token de acceso'));
    }
    return this.authService.getUserPreferences().pipe(
      tap((response: any) => {
        console.log('🔍 DEBUG - Raw response from /auth/profile:', response);

        // Extraer los datos según la estructura de la respuesta
        const preferences: UserPreferences = response.data || response;
        console.log('🔍 DEBUG - Extracted preferences:', preferences);
        console.log('🔍 DEBUG - User permissions:', preferences.permissions);

        ctx.patchState({ preferences });

        // Guardar organizationId y permisos en localStorage
        if (preferences.organizationId) {
          localStorage.setItem('organizationId', preferences.organizationId);
          console.log(
            '🔍 DEBUG - organizationId saved to localStorage:',
            preferences.organizationId,
          );
        } else {
          localStorage.removeItem('organizationId');
          console.log(
            '🔍 DEBUG - organizationId removed from localStorage (SuperAdmin or no organization)',
          );
        }

        // Guardar permisos en localStorage para uso offline
        if (preferences.permissions) {
          localStorage.setItem(
            'userPermissions',
            JSON.stringify(preferences.permissions),
          );
          console.log(
            '🔍 DEBUG - Permissions saved to localStorage:',
            preferences.permissions,
          );
        } else {
          localStorage.removeItem('userPermissions');
        }

        // Si las preferencias incluyen organizationSlug, actualizar la organización
        if (preferences.organizationSlug && preferences.organizationId) {
          const organization = {
            id: preferences.organizationId,
            slug: preferences.organizationSlug,
            name: '', // Se puede completar si es necesario
          };

          console.log('🔍 DEBUG - Updating organization:', organization);

          const currentAuth = ctx.getState().auth;
          ctx.patchState({
            organization,
            auth: currentAuth
              ? {
                  ...currentAuth,
                  organization,
                }
              : null,
          });

          console.log(
            '🔍 DEBUG - State after organization update:',
            ctx.getState(),
          );
        }
      }),
      catchError((err: HttpErrorResponse) => {
        console.error('❌ Error in getUserPreferences:', err);
        return throwError(() => err);
      }),
    );
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>): void {
    ctx.setState({
      auth: null,
      loading: false,
      preferences: null,
      organization: null,
    });
    this.utilsService.cleanStorage();
  }

  // @Action(Register, { cancelUncompleted: true })
  // register(
  //   ctx: StateContext<AuthStateModel>,
  //   action: Register,
  // ): Observable<AuthResponse> {
  //   ctx.patchState({ loading: true });
  //   const { identifier, password } = action.payload;
  //   return this.authService.registerFirebase(identifier, password).pipe(
  //     exhaustMap((firebaseResponse: FirebaseRegisterResponse) => {
  //       return this.authService.register(firebaseResponse.user.email).pipe(
  //         tap((auth: AuthResponse) => {
  //           ctx.patchState({ auth });
  //         }),
  //       );
  //     }),
  //     tap(() => {
  //       ctx.patchState({ loading: false });
  //     }),
  //     catchError((err: HttpErrorResponse) => {
  //       ctx.patchState({ loading: false });
  //       //TODO: convertir los mensajes
  //       this.snackbar.showError('Registro Erroneo', err.message);
  //       return throwError(() => err);
  //     }),
  //   );
  // }

  @Action(ForgotPassword, { cancelUncompleted: true })
  forgotPassword(
    ctx: StateContext<AuthStateModel>,
    action: ForgotPassword,
  ): Observable<AuthResponse> {
    ctx.patchState({ loading: true });
    const { email } = action.payload;
    return this.authService.forgotPassword(email).pipe(
      tap(() => {
        ctx.patchState({ loading: false });
      }),
      catchError((err: HttpErrorResponse) => {
        ctx.patchState({ loading: false });
        //TODO: convertir los mensajes
        this.snackbar.showError('Falló en recuperar contraseña', err.message);
        return throwError(() => err);
      }),
    );
  }

  @Action(GetNewToken, { cancelUncompleted: true })
  getNewToken(
    ctx: StateContext<AuthStateModel>,
    action: GetNewToken,
  ): Observable<AuthResponse> {
    const refreshToken = action.payload;
    const currentOrganization = ctx.getState().organization;
    return this.authService.getNewToken(refreshToken).pipe(
      tap((authResponse: any) => {
        const { accessToken, refreshToken } = authResponse.data;
        ctx.patchState({
          auth: {
            accessToken,
            refreshToken,
            organization: currentOrganization,
          },
        });
      }),
      catchError((err: HttpErrorResponse) => {
        this.snackbar.showError(
          'Sesion Expirada',
          'Por favor inicie sesion nuevamente',
        );
        return throwError(() => err);
      }),
    );
  }

  @Action(SetOrganization)
  setOrganization(
    ctx: StateContext<AuthStateModel>,
    action: SetOrganization,
  ): void {
    const currentAuth = ctx.getState().auth;
    ctx.patchState({
      organization: action.payload,
      auth: currentAuth
        ? {
            ...currentAuth,
            organization: action.payload,
          }
        : null,
    });
  }
}
