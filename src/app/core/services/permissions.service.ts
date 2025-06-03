import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Permission,
  Module,
  DEFAULT_PERMISSIONS,
} from '@core/enums/permissions.enum';
import { AuthService } from '@features/auth/services/auth.service';
import { OrganizationsService } from '@features/organizations/services/organizations.service';
import { RoleService } from '@core/services/role.service';
import { UserRole } from '@core/enums/roles.enum';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  private permissionsSubject = new BehaviorSubject<Permission[]>([]);
  public permissions$ = this.permissionsSubject.asObservable();

  constructor(
    private authService: AuthService,
    private organizationsService: OrganizationsService,
    private roleService: RoleService,
  ) {
    this.loadPermissions();
  }

  private async loadPermissions(): Promise<void> {
    try {
      // Check if user is SuperAdmin first
      const isSuperAdmin = await this.roleService.isSuperAdmin().toPromise();

      if (isSuperAdmin) {
        // SuperAdmins have all permissions
        const allPermissions = Object.values(Permission);
        this.permissionsSubject.next(allPermissions);
        return;
      }

      // For non-SuperAdmin users, get organization permissions
      const organizationId = localStorage.getItem('organizationId');
      if (organizationId) {
        const permissions = await this.organizationsService
          .getOrganizationPermissions(organizationId)
          .toPromise();
        this.permissionsSubject.next(permissions || []);
      } else {
        this.permissionsSubject.next([]);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      this.permissionsSubject.next([]);
    }
  }

  hasPermission(permission: Permission): boolean {
    const currentPermissions = this.permissionsSubject.value;
    return currentPermissions.includes(permission);
  }

  hasAnyPermission(permissions: Permission[]): boolean {
    const currentPermissions = this.permissionsSubject.value;
    return permissions.some((permission) =>
      currentPermissions.includes(permission),
    );
  }

  hasAllPermissions(permissions: Permission[]): boolean {
    const currentPermissions = this.permissionsSubject.value;
    return permissions.every((permission) =>
      currentPermissions.includes(permission),
    );
  }

  getModulePermissions(module: Module): Permission[] {
    const currentPermissions = this.permissionsSubject.value;
    const modulePermissions = DEFAULT_PERMISSIONS[module];
    return currentPermissions.filter((permission) =>
      modulePermissions.includes(permission),
    );
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
      default:
        return false;
    }
  }

  refreshPermissions(): void {
    this.loadPermissions();
  }

  getCurrentPermissions(): Permission[] {
    return this.permissionsSubject.value;
  }
}
