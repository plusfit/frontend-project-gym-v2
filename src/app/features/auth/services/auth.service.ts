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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private utilsService: UtilsService,
    private _auth: Auth,
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
    return this._getUserPreferences();
  }

  _getUserPreferences(): any {
    return sessionStorage.getItem('auth');
  }
  register(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.api}/auth/register`, {
      email,
    });
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
