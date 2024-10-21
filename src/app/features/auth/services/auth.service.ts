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
} from '@angular/fire/auth';

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

  getUserPreferences(userId: string): Observable<UserPreferences> {
    return this.http.get<UserPreferences>(`${environment.api}/user/${userId}`);
  }

  requestReset(): void {
    // TODO
  }

  resetPassword(): void {
    // TODO
  }

  register(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.api}/auth/register`, {
      email,
    });
  }
}
