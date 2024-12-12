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

const handleUnauthorizedError = (
  err: HttpErrorResponse,
  isTokenExpired: boolean,
  store: Store,
  utilsService: UtilsService,
  zone: NgZone,
  router: Router,
): void => {
  if (err.status === 401) {
    if (!isTokenExpired) {
      store.dispatch(new Logout());
    } else {
      utilsService.cleanStorage();
    }
    zone.run(() => router.navigate(['auth/login']));
  }
};

export const authorizeInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const zone = inject(NgZone);
  const store = inject(Store);
  const utilsService = inject(UtilsService);

  const accessToken = store.selectSnapshot(AuthState.accessToken);
  if (!accessToken) {
    return next(request);
  }

  const isTokenExpired = utilsService.isTokenExpired(accessToken);

  return next(request).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err instanceof HttpErrorResponse) {
        handleUnauthorizedError(
          err,
          isTokenExpired,
          store,
          utilsService,
          zone,
          router,
        );
      }
      return throwError(() => err);
    }),
  );
};
