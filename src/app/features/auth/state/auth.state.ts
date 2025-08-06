import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { pickProperties, getFriendlyErrorMessage } from "@core/utilities/helpers";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Observable, catchError, tap, throwError, exhaustMap } from "rxjs";
import { AuthResponse, FirebaseAuthResponse, Profile, UserPreferences } from "../interfaces/auth";
import { AuthService } from "../services/auth.service";
import { ForgotPassword, GetNewToken, GetUserPreferences, Login, Logout } from "./auth.actions";
import { AuthStateModel } from "./auth.model";
import { UtilsService } from "@core/services/utils.service";
import { SnackBarService } from "@core/services/snackbar.service";

@State<AuthStateModel>({
  name: "auth",
  defaults: {
    auth: null,
    loading: false,
    preferences: null,
  },
})
@Injectable({ providedIn: "root" })
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
  static userId(state: AuthStateModel): string | undefined {
    return state.preferences?.id;
  }

  @Selector()
  static userNeedsOnboarding(state: AuthStateModel): boolean | undefined {
    return state.preferences?.needOnboarding;
  }

  @Selector()
  static userData(state: AuthStateModel): Profile | undefined {
    if (!state.preferences) {
      return undefined;
    }
    return pickProperties(state.preferences, "firstName", "lastName", "email", "role.name");
  }

  constructor(
    private authService: AuthService,
    private utilsService: UtilsService,
    private snackbar: SnackBarService,
  ) {}

  @Action(Login, { cancelUncompleted: true })
  login(ctx: StateContext<AuthStateModel>, action: Login): Observable<AuthResponse> {
    ctx.patchState({ loading: true });
    return this.authService.loginFirebase(action.payload).pipe(
      exhaustMap((response: FirebaseAuthResponse) => {
        return this.authService
          .login(response._tokenResponse.idToken, action.payload.recaptchaToken)
          .pipe(
            tap((authResponse: any) => {
              const { accessToken, refreshToken } = authResponse.data;
              ctx.patchState({
                auth: {
                  accessToken,
                  refreshToken,
                },
              });
            }),
          );
      }),
      tap(() => {
        ctx.patchState({ loading: false });
      }),
      catchError((err: HttpErrorResponse) => {
        ctx.patchState({ loading: false });
        const errorMessage = getFriendlyErrorMessage(err, "Error al iniciar sesión");
        this.snackbar.showError("Login Erróneo", errorMessage);
        return throwError(() => err);
      }),
    );
  }

  @Action(GetUserPreferences, { cancelUncompleted: true })
  getUserPreferences(ctx: StateContext<AuthStateModel>): Observable<UserPreferences> {
    ctx.patchState({ preferences: null });
    const accessToken = ctx.getState().auth?.accessToken;
    if (!accessToken) {
      return throwError(() => new Error("No hay token de acceso"));
    }
    return this.authService.getUserPreferences().pipe(
      tap((preferences: UserPreferences) => {
        ctx.patchState({ preferences });
      }),
      catchError((err: HttpErrorResponse) => {
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
        this.snackbar.showError("Falló en recuperar contraseña", err.message);
        return throwError(() => err);
      }),
    );
  }

  @Action(GetNewToken, { cancelUncompleted: true })
  getNewToken(ctx: StateContext<AuthStateModel>, action: GetNewToken): Observable<AuthResponse> {
    const refreshToken = action.payload;
    return this.authService.getNewToken(refreshToken).pipe(
      tap((authResponse: any) => {
        const { accessToken, refreshToken } = authResponse.data;
        ctx.patchState({
          auth: {
            accessToken,
            refreshToken,
          },
        });
      }),
      catchError((err: HttpErrorResponse) => {
        this.snackbar.showError("Sesion Expirada", "Por favor inicie sesion nuevamente");
        //ctx.dispatch(new Logout());
        return throwError(() => err);
      }),
    );
  }
}
