import {
  HttpRequest,
  HttpHandlerFn,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthState } from '@features/auth/state/auth.state';
import { Store } from '@ngxs/store';

export const organizationInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const store = inject(Store);

  const isAuthEndpoint = request.url.includes('/auth/');
  const isOrganizationEndpoint = request.url.includes('/organizations');

  if (isAuthEndpoint || isOrganizationEndpoint) {
    return next(request);
  }

  const isAuthenticated = store.selectSnapshot(AuthState.isAuthenticated);
  const organizationSlug = store.selectSnapshot(AuthState.organizationSlug);

  if (isAuthenticated && organizationSlug) {
    const modifiedRequest = request.clone({
      setHeaders: {
        'x-organization': organizationSlug,
      },
    });
    return next(modifiedRequest);
  }

  return next(request);
};
