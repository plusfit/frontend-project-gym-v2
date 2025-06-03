import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Permission, Module } from '@core/enums/permissions.enum';
import { PermissionsService } from '@core/services/permissions.service';
import { RoleService } from '@core/services/role.service';
import { UserRole } from '@core/enums/roles.enum';

@Injectable({
  providedIn: 'root',
})
export class PermissionsGuard implements CanActivate {
  constructor(
    private permissionsService: PermissionsService,
    private roleService: RoleService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> | Promise<boolean> | boolean {
    const requiredPermissions = route.data['permissions'] as Permission[];
    const requiredModule = route.data['module'] as Module;
    const requireAll = (route.data['requireAll'] as boolean) || false;

    // If no permissions are required, allow access
    if (!requiredPermissions && !requiredModule) {
      return true;
    }

    // Check if user is SuperAdmin first
    return this.roleService.isSuperAdmin().pipe(
      switchMap((isSuperAdmin) => {
        if (isSuperAdmin) {
          return of(true); // SuperAdmins have access to everything
        }

        // For non-SuperAdmin users, check permissions
        return this.permissionsService.permissions$.pipe(
          map((userPermissions) => {
            if (userPermissions.length === 0) {
              this.router.navigate(['/unauthorized']);
              return false;
            }

            // Check module access
            if (
              requiredModule &&
              !this.permissionsService.canAccessModule(requiredModule)
            ) {
              this.router.navigate(['/unauthorized']);
              return false;
            }

            // Check specific permissions
            if (requiredPermissions) {
              const hasPermission = requireAll
                ? this.permissionsService.hasAllPermissions(requiredPermissions)
                : this.permissionsService.hasAnyPermission(requiredPermissions);

              if (!hasPermission) {
                this.router.navigate(['/unauthorized']);
                return false;
              }
            }

            return true;
          }),
        );
      }),
      catchError(() => {
        this.router.navigate(['/unauthorized']);
        return of(false);
      }),
    );
  }
}
