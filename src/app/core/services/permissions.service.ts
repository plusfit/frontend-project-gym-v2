import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Permission,
  Module,
  DEFAULT_PERMISSIONS,
} from '@core/enums/permissions.enum';
import { Store } from '@ngxs/store';
import { AuthState } from '@features/auth/state/auth.state';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  private permissionsSubject = new BehaviorSubject<Permission[]>([]);
  public permissions$ = this.permissionsSubject.asObservable();

  constructor(private store: Store) {
    this.store.select(AuthState.userPermissions).subscribe((permissions) => {
      this.permissionsSubject.next(permissions || []);
    });
  }

  hasPermission(permission: Permission): boolean {
    const permissions = this.permissionsSubject.value;
    return permissions.includes(permission);
  }

  hasAnyPermission(permissions: Permission[]): boolean {
    const userPermissions = this.permissionsSubject.value;
    return permissions.some((permission) =>
      userPermissions.includes(permission),
    );
  }

  hasAllPermissions(permissions: Permission[]): boolean {
    const userPermissions = this.permissionsSubject.value;
    return permissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }

  getModulePermissions(module: Module): Permission[] {
    const userPermissions = this.permissionsSubject.value;
    const modulePermissions = DEFAULT_PERMISSIONS[module];
    return userPermissions.filter((permission) =>
      modulePermissions.includes(permission),
    );
  }

  getCurrentPermissions(): Permission[] {
    return this.permissionsSubject.value;
  }

  canAccessModule(module: Module): boolean {
    const modulePermissions = this.getModulePermissions(module);
    return modulePermissions.length > 0;
  }

  canCreate(module: Module): boolean {
    switch (module) {
      case Module.CLIENTS:
        return this.hasPermission(Permission.CLIENT_CREATE);
      case Module.ROUTINES:
        return this.hasPermission(Permission.ROUTINE_CREATE);
      case Module.PLANS:
        return this.hasPermission(Permission.PLAN_CREATE);
      case Module.SCHEDULES:
        return this.hasPermission(Permission.SCHEDULE_CREATE);
      case Module.EXERCISES:
        return this.hasPermission(Permission.EXERCISE_CREATE);
      case Module.SCREEN:
        return this.hasPermission(Permission.SCREEN_MANAGE);
      default:
        return false;
    }
  }

  canRead(module: Module): boolean {
    switch (module) {
      case Module.CLIENTS:
        return this.hasPermission(Permission.CLIENT_READ);
      case Module.ROUTINES:
        return this.hasPermission(Permission.ROUTINE_READ);
      case Module.PLANS:
        return this.hasPermission(Permission.PLAN_READ);
      case Module.SCHEDULES:
        return this.hasPermission(Permission.SCHEDULE_READ);
      case Module.EXERCISES:
        return this.hasPermission(Permission.EXERCISE_READ);
      case Module.SCREEN:
        return this.hasPermission(Permission.SCREEN_VIEW);
      default:
        return false;
    }
  }

  canUpdate(module: Module): boolean {
    switch (module) {
      case Module.CLIENTS:
        return this.hasPermission(Permission.CLIENT_UPDATE);
      case Module.ROUTINES:
        return this.hasPermission(Permission.ROUTINE_UPDATE);
      case Module.PLANS:
        return this.hasPermission(Permission.PLAN_UPDATE);
      case Module.SCHEDULES:
        return this.hasPermission(Permission.SCHEDULE_UPDATE);
      case Module.EXERCISES:
        return this.hasPermission(Permission.EXERCISE_UPDATE);
      case Module.SCREEN:
        return this.hasPermission(Permission.SCREEN_MANAGE);
      default:
        return false;
    }
  }

  canDelete(module: Module): boolean {
    switch (module) {
      case Module.CLIENTS:
        return this.hasPermission(Permission.CLIENT_DELETE);
      case Module.ROUTINES:
        return this.hasPermission(Permission.ROUTINE_DELETE);
      case Module.PLANS:
        return this.hasPermission(Permission.PLAN_DELETE);
      case Module.SCHEDULES:
        return this.hasPermission(Permission.SCHEDULE_DELETE);
      case Module.EXERCISES:
        return this.hasPermission(Permission.EXERCISE_DELETE);
      case Module.SCREEN:
        return this.hasPermission(Permission.SCREEN_MANAGE);
      default:
        return false;
    }
  }

  canViewScreen(): boolean {
    return this.hasPermission(Permission.SCREEN_VIEW);
  }

  canManageScreen(): boolean {
    return this.hasPermission(Permission.SCREEN_MANAGE);
  }

  refreshPermissions(): void {
    // Este método se mantiene para compatibilidad, pero ahora los permisos
    // se actualizan automáticamente cuando se actualizan las preferencias del usuario
  }
}
