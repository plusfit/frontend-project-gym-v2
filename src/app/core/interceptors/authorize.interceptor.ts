import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UtilsService } from '@core/services/utils.service';
import { Logout } from '@features/auth/state/auth.actions';
import { AuthState } from '@features/auth/state/auth.state';
import { Store } from '@ngxs/store';
import { NgZone } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

/**
 * Interceptor to handle Authorization using HttpInterceptorFn.
 */
export const authorizeInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const zone = inject(NgZone);
  const store = inject(Store);
  const utilsService = inject(UtilsService);

  const errCodes = [401];
  const accessToken = store.selectSnapshot(AuthState.accessToken);
  const isTokenExpired = utilsService.isTokenExpired(accessToken!);

  return next(request).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err instanceof HttpErrorResponse) {
        if (errCodes.includes(err.status)) {
          if (!isTokenExpired) {
            store.dispatch(new Logout());
          } else {
            utilsService.cleanStorage();
          }
          zone.run(() => router.navigate(['auth/login']));
        }
      }
      return throwError(() => err);
    }),
  );
};
