import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { UtilsService } from '@core/services/utils.service';
import { Logout } from '@features/auth/state/auth.actions';
import { AuthState } from '@features/auth/state/auth.state';
import { Store } from '@ngxs/store';
import { Observable, catchError, throwError } from 'rxjs';
/**
 * Interceptor to handle Authorization
 * @implements HttpInterceptor
 */
@Injectable()
export class AuthorizeInterceptor implements HttpInterceptor {
  /**
   * The error codes that trigger a logout.
   */
  errCodes = [401];

  /**
   * Creates an instance of AuthorizeInterceptor.
   * @param {Router} router - The Angular router.
   * @param {NgZone} zone - The Angular zone.
   * @param {Store} store - The Ngxs store.
   * @param {UtilsService} utilsService - The shared utils service.
   */
  constructor(
    private router: Router,
    private zone: NgZone,
    private store: Store,
    private utilsService: UtilsService,
  ) {}

  /**
   * Intercepts an outgoing HTTP request and adds an access token to it.
   * @param {HttpRequest<unknown>} request The outgoing HTTP request.
   * @param {HttpHandler} next The next HTTP handler in the chain.
   * @returns {Observable<HttpEvent<unknown>>} An observable of the HTTP response.
   */
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const accessToken = this.store.selectSnapshot(AuthState.accessToken);
    const isTokenExpired = this.utilsService.isTokenExpired(accessToken!);

    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err instanceof HttpErrorResponse) {
          if (this.errCodes.some((code: number) => code === err.status)) {
            if (!isTokenExpired) {
              this.store.dispatch(new Logout());
            } else {
              this.utilsService.cleanStorage();
            }
            this.zone.run(() => this.router.navigate(['auth/login']));
          }
        }
        return throwError(() => err);
      }),
    );
  }
}
