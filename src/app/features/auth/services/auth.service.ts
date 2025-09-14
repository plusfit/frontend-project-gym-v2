import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { from, Observable } from "rxjs";

import { AuthCredentials, AuthResponse, UserPreferences } from "../interfaces/auth";
import { UtilsService } from "@core/services/utils.service";
import { environment } from "../../../../environments/environment";
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword as signInForDelete,
  deleteUser,
  User,
} from "@angular/fire/auth";
import { RefreshTokenPayload } from "@core/interfaces/refresh-token.interface";
import { RegisterResponse } from "@features/client/interface/clients.interface";

@Injectable({
  providedIn: "root",
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

  login(token: string, recaptchaToken?: string): Observable<AuthResponse> {
    const payload: { token: string; recaptchaToken?: string } = { token };

    if (recaptchaToken) {
      payload.recaptchaToken = recaptchaToken;
    }

    return this.http.post<AuthResponse>(`${environment.api}/auth/login`, payload);
  }

  getUserPreferences(): Observable<UserPreferences> {
    return this._getUserPreferences();
  }

  _getUserPreferences(): any {
    return sessionStorage.getItem("auth");
  }
  register(email: string, recaptchaToken?: string): Observable<RegisterResponse> {
    const payload: { email: string; recaptchaToken?: string } = { email };
    if (recaptchaToken) payload.recaptchaToken = recaptchaToken;
    return this.http.post<RegisterResponse>(`${environment.api}/auth/register`, payload);
  }

  forgotPassword(email: string): any {
    return from(sendPasswordResetEmail(this._auth, email));
  }

  getNewToken(refreshToken: RefreshTokenPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.api}/auth/refreshToken`, refreshToken);
  }

  /**
   * Elimina un usuario de Firebase Auth
   * Para eliminar otro usuario, necesitas autenticarte temporalmente como ese usuario
   */
  deleteFirebaseUser(email: string, password: string): Observable<void> {
    return new Observable(observer => {
      // Guardar el usuario actual
      const currentUser = this._auth.currentUser;
      
      // Autenticarse temporalmente como el usuario a eliminar
      signInWithEmailAndPassword(this._auth, email, password)
        .then((userCredential) => {
          const userToDelete = userCredential.user;
          
          // Eliminar el usuario
          return deleteUser(userToDelete);
        })
        .then(() => {
          // Reautenticar al usuario original si existía
          if (currentUser) {
            // Nota: En un escenario real, necesitarías manejar la reautenticación
            // del usuario original de manera más robusta
            console.log('Usuario eliminado de Firebase Auth');
          }
          observer.next();
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }
}
