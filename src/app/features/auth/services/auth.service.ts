import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';

import {
  AuthCredentials,
  AuthResponse,
  UserPreferences,
} from '../interfaces/auth';
import { UtilsService } from '@core/services/utils.service';
import { environment } from '../../../../environments/environment';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from '@angular/fire/auth';
import { RefreshTokenPayload } from '@core/interfaces/refresh-token.interface';
import { RegisterResponse } from '@features/client/interface/clients.interface';
import { Store } from '@ngxs/store';
import { AuthState } from '../state/auth.state';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private utilsService: UtilsService,
    private _auth: Auth,
    private store: Store,
  ) {}
  // googleLogin(): Observable<UserCredential> {
  //   return from(signInWithPopup(this._auth, new GoogleAuthProvider()));
  // }

  registerFirebase(email: string, password: string): any {
    return from(createUserWithEmailAndPassword(this._auth, email, password));
  }

  loginFirebase(authCredentials: AuthCredentials): any {
    const { identifier, password } = authCredentials;
    return from(signInWithEmailAndPassword(this._auth, identifier, password));
  }

  login(token: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.api}/auth/login`, {
      token,
    });
  }

  getUserPreferences(): Observable<UserPreferences> {
    return this.http.get<UserPreferences>(`${environment.api}/auth/profile`);
  }

  register(email: string): Observable<RegisterResponse> {
    const organizationSlug = this.store.selectSnapshot(AuthState.organizationSlug);
    
    const headers: any = {};
    if (organizationSlug) {
      headers['x-organization'] = organizationSlug;
    }

    return this.http.post<RegisterResponse>(
      `${environment.api}/auth/register`,
      {
        email,
      },
      { headers }
    );
  }

  forgotPassword(email: string): any {
    return from(sendPasswordResetEmail(this._auth, email));
  }

  getNewToken(refreshToken: RefreshTokenPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.api}/auth/refreshToken`,
      refreshToken,
    );
  }
}
