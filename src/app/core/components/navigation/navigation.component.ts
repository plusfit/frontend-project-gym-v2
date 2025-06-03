import { NgClass } from '@angular/common';
import { Component, input, InputSignal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { RoleService } from '@core/services/role.service';
import { UserRole } from '@core/enums/roles.enum';
import { CommonModule } from '@angular/common';
import { HasPermissionDirective } from '@shared/directives';
import { Permission, Module } from '@core/enums/permissions.enum';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterLink, NgClass, CommonModule, HasPermissionDirective],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css',
})
export class NavigationComponent implements OnInit {
  isMenuOpen: InputSignal<boolean> = input<boolean>(false);

  appName = '+Fit';

  isSuperAdmin$!: Observable<boolean>;
  isAdmin$!: Observable<boolean>;
  isClient$!: Observable<boolean>;

  Permission = Permission;
  Module = Module;

  constructor(private roleService: RoleService) {}

  ngOnInit(): void {
    this.isSuperAdmin$ = this.roleService.hasRole(UserRole.SUPER_ADMIN);
    this.isAdmin$ = this.roleService.hasRole(UserRole.ADMIN);
    this.isClient$ = this.roleService.hasRole(UserRole.CLIENT);
  }
}
