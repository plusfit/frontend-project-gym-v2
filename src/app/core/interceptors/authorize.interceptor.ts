import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  HttpInterceptorFn,
} from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { UtilsService } from "@core/services/utils.service";
import { GetNewToken, Logout } from "@features/auth/state/auth.actions";
import { AuthState } from "@features/auth/state/auth.state";
import { Actions, ofActionSuccessful, Store } from "@ngxs/store";
import { NgZone } from "@angular/core";
import { Observable, catchError, throwError } from "rxjs";

const handleUnauthorizedError = (
  actions: Actions,
  err: HttpErrorResponse,
  isAccessTokenExpired: boolean,
  isRefreshTokenExpired: boolean,
  store: Store,
  utilsService: UtilsService,
  zone: NgZone,
  router: Router,
): void => {
  console.log(err);

  if (err.status === 401 || err.status === 0) {
    //TODO: status 0 cuando es un 401, ver porque
    if (isAccessTokenExpired && !isRefreshTokenExpired) {
      store.dispatch(
        new GetNewToken({
          refreshToken: store.selectSnapshot(AuthState.refreshToken),
        }),
      );

      //actions.pipe(ofActionSuccessful(GetNewToken)).subscribe(() => {
      // window.location.reload(); //hago el reload para que el usuario no tenga que hacerlo y pase "mas desapercibido"
      //});
    } else {
      store.dispatch(new Logout());
      zone.run(() => router.navigate(["auth/login"]));
    }
  }
};

export const authorizeInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const actions = inject(Actions);
  const router = inject(Router);
  const zone = inject(NgZone);
  const store = inject(Store);
  const utilsService = inject(UtilsService);

  const accessToken = store.selectSnapshot(AuthState.accessToken);
  const refreshToken = store.selectSnapshot(AuthState.refreshToken);
  if (!accessToken) {
    return next(request);
  }
  if (!refreshToken) {
    return next(request);
  }

  const isAccessTokenExpired = utilsService.isTokenExpired(accessToken);

  const isRefreshTokenExpired = utilsService.isTokenExpired(refreshToken);

  return next(request).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err instanceof HttpErrorResponse) {
        handleUnauthorizedError(
          actions,
          err,
          isAccessTokenExpired,
          isRefreshTokenExpired,
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
