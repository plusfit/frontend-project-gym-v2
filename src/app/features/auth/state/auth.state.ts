import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { pickProperties } from '@core/utilities/helpers';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Observable, catchError, tap, throwError, exhaustMap } from 'rxjs';
import {
  AuthResponse,
  FirebaseAuthResponse,
  FirebaseRegisterResponse,
  Profile,
  UserPreferences,
} from '../interfaces/auth';
import { AuthService } from '../services/auth.service';
import { GetUserPreferences, Login, Logout, Register } from './auth.actions';
import { AuthStateModel } from './auth.model';
import { UtilsService } from '@core/services/utils.service';

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    auth: null,
    loading: false,
    preferences: null,
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
    return state.auth?.data.accessToken;
  }

  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return !!state.auth?.success;
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
    return pickProperties(
      state.preferences,
      'firstName',
      'lastName',
      'email',
      'role.name',
    );
  }

  constructor(
    private authService: AuthService,
    private utilsService: UtilsService,
  ) {}

  @Action(Login, { cancelUncompleted: true })
  login(
    ctx: StateContext<AuthStateModel>,
    action: Login,
  ): Observable<AuthResponse> {
    ctx.patchState({ loading: true });
    return this.authService.loginFirebase(action.payload).pipe(
      exhaustMap((response: FirebaseAuthResponse) => {
        return this.authService.login(response._tokenResponse.idToken).pipe(
          tap((auth: AuthResponse) => {
            ctx.patchState({ auth });
          }),
        );
      }),
      tap(() => {
        ctx.patchState({ loading: false });
      }),
      catchError((err: HttpErrorResponse) => {
        ctx.patchState({ loading: false });
        return throwError(() => err);
      }),
    );
  }

  @Action(GetUserPreferences, { cancelUncompleted: true })
  getUserPreferences(
    ctx: StateContext<AuthStateModel>,
  ): Observable<UserPreferences> {
    ctx.patchState({ preferences: null });
    const accessToken = ctx.getState().auth?.data.accessToken;
    const userId = this.utilsService.getUserIdFromToken(accessToken!);

    return this.authService.getUserPreferences(userId).pipe(
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

  @Action(Register, { cancelUncompleted: true })
  register(
    ctx: StateContext<AuthStateModel>,
    action: Register,
  ): Observable<AuthResponse> {
    ctx.patchState({ loading: true });
    const { identifier, password } = action.payload;
    return this.authService.registerFirebase(identifier, password).pipe(
      exhaustMap((firebaseResponse: FirebaseRegisterResponse) => {
        return this.authService.register(firebaseResponse.user.email).pipe(
          tap((auth: AuthResponse) => {
            ctx.patchState({ auth });
          }),
        );
      }),
      tap(() => {
        ctx.patchState({ loading: false });
      }),
      catchError((err: HttpErrorResponse) => {
        ctx.patchState({ loading: false });
        return throwError(() => err);
      }),
    );
  }
}
