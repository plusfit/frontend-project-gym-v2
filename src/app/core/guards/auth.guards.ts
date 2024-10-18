import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthState } from '@features/auth/state/auth.state';
import { Store } from '@ngxs/store';

/**
 * A guard that checks if the user is authenticated before allowing access to a route.
 * @returns A boolean indicating whether the user is authenticated or not.
 */
export const authGuard: CanActivateFn = () => {
  const store = inject(Store);

  const isAuthenticated = store.selectSnapshot(AuthState.isAuthenticated);
  if (isAuthenticated) {
    return false;
  } else {
    return true;
  }
};
