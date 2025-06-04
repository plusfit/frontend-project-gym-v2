import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthState } from '@features/auth/state/auth.state';
import { UserRole } from '../enums/roles.enum';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  constructor(private store: Store) {}

  getCurrentUserRole(): Observable<UserRole | null> {
    return this.store.select(AuthState.userData).pipe(
      map((userData) => {
        if (!userData || !userData.role) {
          return null;
        }
        return userData.role as UserRole;
      }),
    );
  }

  hasRole(requiredRole: UserRole): Observable<boolean> {
    return this.getCurrentUserRole().pipe(
      map((currentRole) => currentRole === requiredRole),
    );
  }

  hasAnyRole(requiredRoles: UserRole[]): Observable<boolean> {
    return this.getCurrentUserRole().pipe(
      map((currentRole) => {
        if (!currentRole) return false;
        return requiredRoles.includes(currentRole);
      }),
    );
  }

  isSuperAdmin(): Observable<boolean> {
    return this.hasRole(UserRole.SUPER_ADMIN);
  }

  isAdmin(): Observable<boolean> {
    return this.hasRole(UserRole.ADMIN);
  }

  isClient(): Observable<boolean> {
    return this.hasRole(UserRole.CLIENT);
  }
}
