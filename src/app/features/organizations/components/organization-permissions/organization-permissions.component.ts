import { Component, Input, OnInit, OnChanges, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';

import {
  Organization,
  UpdateOrganizationPermissionsDto,
} from '../../interfaces/organization.interface';
import {
  Permission,
  Module,
  DEFAULT_PERMISSIONS,
} from '@core/enums/permissions.enum';
import { OrganizationsService } from '../../services/organizations.service';
import { SnackBarService } from '@core/services/snackbar.service';

interface PermissionModule {
  module: Module;
  name: string;
  icon: string;
  description: string;
  permissions: PermissionItem[];
  allSelected: boolean;
  indeterminate: boolean;
}

interface PermissionItem {
  permission: Permission;
  name: string;
  description: string;
  selected: boolean;
}

@Component({
  selector: 'app-organization-permissions',
  standalone: true,
  imports: [
    FormsModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
],
  templateUrl: './organization-permissions.component.html',
  styleUrl: './organization-permissions.component.css',
})
export class OrganizationPermissionsComponent implements OnInit, OnChanges {
  @Input() organization: Organization | null = null;

  private organizationsService = inject(OrganizationsService);
  private snackBarService = inject(SnackBarService);

  permissionModules: PermissionModule[] = [];
  loading = false;
  saving = false;
  hasChanges = false;
  originalPermissions: Permission[] = [];

  ngOnInit() {
    this.initializePermissions();
  }

  ngOnChanges() {
    if (this.organization) {
      this.initializePermissions();
    }
  }

  private initializePermissions() {
    if (!this.organization) {
      this.organization = {
        _id: 'demo-org-id',
        name: 'Organización Demo',
        slug: 'org-demo',
        isActive: true,
        maxClients: 100,
        permissions: Object.values(Permission),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    this.originalPermissions = [...(this.organization?.permissions || [])];
    this.permissionModules = this.createPermissionModules();
    this.updateModuleStates();
  }

  private createPermissionModules(): PermissionModule[] {
    const modules = [
      {
        module: Module.CLIENTS,
        name: 'Clientes',
        icon: 'users',
        description: 'Gestionar información de clientes y miembros',
      },
      {
        module: Module.ROUTINES,
        name: 'Rutinas',
        icon: 'list-dashes',
        description: 'Crear y administrar rutinas de ejercicios',
      },
      {
        module: Module.PLANS,
        name: 'Planes',
        icon: 'clipboard-text',
        description: 'Administrar planes de membresía y servicios',
      },
      {
        module: Module.SCHEDULES,
        name: 'Horarios',
        icon: 'calendar',
        description: 'Gestionar horarios y reservas',
      },
      {
        module: Module.EXERCISES,
        name: 'Ejercicios',
        icon: 'barbell',
        description: 'Administrar biblioteca de ejercicios',
      },
      {
        module: Module.REPORTS,
        name: 'Reportes',
        icon: 'chart-bar',
        description: 'Acceder a reportes y análisis de datos',
      },
    ];

    return modules.map((moduleInfo) => ({
      ...moduleInfo,
      permissions: this.createPermissionItems(moduleInfo.module),
      allSelected: false,
      indeterminate: false,
    }));
  }

  private createPermissionItems(module: Module): PermissionItem[] {
    const modulePermissions = DEFAULT_PERMISSIONS[module] || [];
    const permissionLabels = {
      create: { name: 'Crear', description: 'Crear nuevos registros' },
      read: { name: 'Leer', description: 'Ver y consultar información' },
      update: {
        name: 'Actualizar',
        description: 'Modificar registros existentes',
      },
      delete: { name: 'Eliminar', description: 'Eliminar registros' },
      view: { name: 'Visualizar', description: 'Ver dashboard y métricas básicas' },
      export: { name: 'Exportar', description: 'Descargar reportes en Excel' },
      advanced: { name: 'Avanzado', description: 'Acceder a métricas financieras y analytics avanzados' },
    };

    return modulePermissions.map((permission) => {
      const action = permission.split(':')[1];
      const label = permissionLabels[action as keyof typeof permissionLabels];

      return {
        permission,
        name: label?.name || action,
        description: label?.description || '',
        selected: this.organization?.permissions?.includes(permission) || false,
      };
    });
  }

  private updateModuleStates() {
    for (const module of this.permissionModules) {
      const selectedCount = module.permissions.filter((p) => p.selected).length;
      const totalCount = module.permissions.length;

      module.allSelected = selectedCount === totalCount;
      module.indeterminate = selectedCount > 0 && selectedCount < totalCount;
    }
  }

  onModuleToggle(module: PermissionModule) {
    const newState = !module.allSelected;
    for (const permission of module.permissions) {
      permission.selected = newState;
    }
    this.updateModuleStates();
    this.checkForChanges();
  }

  onPermissionToggle() {
    this.updateModuleStates();
    this.checkForChanges();
  }

  private checkForChanges() {
    const currentPermissions = this.getSelectedPermissions();
    this.hasChanges = !this.arraysEqual(
      currentPermissions,
      this.originalPermissions,
    );
  }

  private getSelectedPermissions(): Permission[] {
    const selected: Permission[] = [];
    for (const module of this.permissionModules) {
      for (const permission of module.permissions) {
        if (permission.selected) {
          selected.push(permission.permission);
        }
      }
    }

    if (!selected.includes(Permission.ORGANIZATION_ADMIN)) {
      selected.push(Permission.ORGANIZATION_ADMIN);
    }

    return selected;
  }

  private arraysEqual(a: Permission[], b: Permission[]): boolean {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, index) => val === sortedB[index]);
  }

  onSave() {
    if (
      !this.organization ||
      !this.hasChanges ||
      this.organization._id === 'demo-org-id'
    ) {
      if (this.organization?._id === 'demo-org-id') {
        this.snackBarService.showInfo(
          'Modo Demostración',
          'Esta es una demostración. Los cambios no se guardan.',
        );
      }
      return;
    }

    if (!this.organization._id || this.organization._id === 'undefined') {
      this.snackBarService.showError('Error', 'ID de organización inválido');
      return;
    }

    this.saving = true;
    const selectedPermissions = this.getSelectedPermissions();
    const updateDto: UpdateOrganizationPermissionsDto = {
      permissions: selectedPermissions,
    };

    this.organizationsService
      .updateOrganizationPermissions(this.organization._id, updateDto)
      .pipe(
        finalize(() => {
          this.saving = false;
        }),
      )
      .subscribe({
        next: (updatedOrg) => {
          this.organization = updatedOrg;
          this.originalPermissions = [...selectedPermissions];
          this.hasChanges = false;
          this.snackBarService.showSuccess(
            'Éxito',
            'Permisos actualizados correctamente',
          );
        },
        error: (error) => {
          this.snackBarService.showError(
            'Error',
            'Error al actualizar los permisos',
          );
        },
      });
  }

  onReset() {
    this.initializePermissions();
    this.hasChanges = false;
  }

  selectAllPermissions() {
    for (const module of this.permissionModules) {
      for (const permission of module.permissions) {
        permission.selected = true;
      }
    }
    this.updateModuleStates();
    this.checkForChanges();
  }

  deselectAllPermissions() {
    for (const module of this.permissionModules) {
      for (const permission of module.permissions) {
        permission.selected = false;
      }
    }
    this.updateModuleStates();
    this.checkForChanges();
  }
}
