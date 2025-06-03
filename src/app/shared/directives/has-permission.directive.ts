import {
  Directive,
  Input,
  ElementRef,
  OnInit,
  OnDestroy,
  Renderer2,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Permission, Module } from '@core/enums/permissions.enum';
import { PermissionsService } from '@core/services/permissions.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private permission: Permission | Permission[] | null = null;
  private module: Module | null = null;
  private requireAll = false;

  @Input() set appHasPermission(permission: Permission | Permission[]) {
    this.permission = permission;
    this.updateVisibility();
  }

  @Input() set appHasPermissionModule(module: Module) {
    this.module = module;
    this.updateVisibility();
  }

  @Input() set appHasPermissionRequireAll(requireAll: boolean) {
    this.requireAll = requireAll;
    this.updateVisibility();
  }

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private permissionsService: PermissionsService,
  ) {}

  ngOnInit(): void {
    this.permissionsService.permissions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateVisibility();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateVisibility(): void {
    if (!this.permission) {
      this.renderer.setStyle(this.elementRef.nativeElement, 'display', 'none');
      return;
    }

    const hasPermission = this.checkPermission();

    if (hasPermission) {
      this.renderer.removeStyle(this.elementRef.nativeElement, 'display');
    } else {
      this.renderer.setStyle(this.elementRef.nativeElement, 'display', 'none');
    }
  }

  private checkPermission(): boolean {
    if (!this.permission) {
      return false;
    }

    // Check module access first if module is specified
    if (this.module && !this.permissionsService.canAccessModule(this.module)) {
      return false;
    }

    if (Array.isArray(this.permission)) {
      return this.requireAll
        ? this.permissionsService.hasAllPermissions(this.permission)
        : this.permissionsService.hasAnyPermission(this.permission);
    }

    return this.permissionsService.hasPermission(this.permission);
  }
}
