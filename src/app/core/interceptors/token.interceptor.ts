import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpRequest,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthState } from '@features/auth/state/auth.state';
import { Store } from '@ngxs/store';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor to handle Tokens using HttpInterceptorFn.
 */
export const tokenInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const store = inject(Store);
  const token = store.selectSnapshot(AuthState.accessToken);

  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      return throwError(() => error);
    }),
  );
};
