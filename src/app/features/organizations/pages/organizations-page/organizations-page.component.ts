import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SnackBarService } from '@core/services/snackbar.service';

import { Organization } from '../../interfaces/organization.interface';
import { OrganizationsState } from '../../state/organizations.state';
import {
  GetOrganizations,
  CreateOrganization,
  UpdateOrganization,
  DeleteOrganization,
} from '../../state/organizations.actions';
import { OrganizationFormComponent } from '../../components/organization-form/organization-form.component';
import { TableComponent } from '@shared/components/table/table.component';
import { TitleComponent } from '@shared/components/title/title.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-organizations-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    OrganizationFormComponent,
    TableComponent,
    TitleComponent,
  ],
  templateUrl: './organizations-page.component.html',
  styleUrl: './organizations-page.component.css',
})
export class OrganizationsPageComponent implements OnInit, OnDestroy {
  organizations$: Observable<Organization[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  showForm = false;
  selectedOrganization: Organization | null = null;
  isEditing = false;
  includeInactive = true;

  displayedColumns = [
    'name',
    'slug',
    'description',
    'maxClients',
    'isActive',
    'createdAt',
    'acciones',
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private router: Router,
    private dialog: MatDialog,
    private snackBarService: SnackBarService,
  ) {
    this.organizations$ = this.store.select(
      OrganizationsState.getOrganizations,
    );
    this.loading$ = this.store.select(OrganizationsState.getLoading);
    this.error$ = this.store.select(OrganizationsState.getError);
  }

  ngOnInit(): void {
    this.loadOrganizations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrganizations(): void {
    this.store.dispatch(new GetOrganizations(this.includeInactive));
  }

  toggleInactiveFilter(): void {
    // No necesitamos cambiar el valor aquí porque [(ngModel)] ya lo maneja
    this.loadOrganizations();
  }

  onCreateNew(): void {
    this.selectedOrganization = null;
    this.isEditing = false;
    this.showForm = true;
  }

  onEdit(organizationId: string): void {
    this.organizations$
      .pipe(takeUntil(this.destroy$))
      .subscribe((organizations) => {
        this.selectedOrganization =
          organizations.find((org) => org._id === organizationId) || null;
        this.isEditing = true;
        this.showForm = true;
      });
  }

  onDelete(organization: Organization): void {
    const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(
      ConfirmDialogComponent,
      {
        width: '500px',
        data: {
          title: 'Eliminar Organización',
          contentMessage: `¿Estás seguro de que deseas eliminar la organización "${organization.name}"? Esta acción no se puede deshacer.`,
        },
      },
    );

    dialogRef.componentInstance.confirm.subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.store.dispatch(new DeleteOrganization(organization._id));
      }
    });
  }

  onFormSubmit(formData: any): void {
    if (this.isEditing && this.selectedOrganization) {
      // Actualizar organización existente
      this.store
        .dispatch(
          new UpdateOrganization(this.selectedOrganization._id, formData),
        )
        .subscribe({
          next: () => {
            this.snackBarService.showSuccess(
              'Organización actualizada',
              'La organización se ha actualizado correctamente',
            );
            this.onFormCancel();
          },
          error: (error) => {
            this.snackBarService.showError(
              'Error al actualizar',
              'No se pudo actualizar la organización. Por favor, inténtalo de nuevo.',
            );
          },
        });
    } else {
      // Crear nueva organización
      this.store.dispatch(new CreateOrganization(formData)).subscribe({
        next: () => {
          this.snackBarService.showSuccess(
            'Organización creada',
            'La organización se ha creado correctamente',
          );
          this.onFormCancel();
        },
        error: (error) => {
          this.snackBarService.showError(
            'Error al crear',
            'No se pudo crear la organización. Por favor, inténtalo de nuevo.',
          );
        },
      });
    }
  }

  onFormCancel(): void {
    this.showForm = false;
    this.selectedOrganization = null;
    this.isEditing = false;
  }

  onSeeDetail(organizationId: string): void {
    this.router.navigate(['/organizaciones/detalle', organizationId]);
  }

  trackByFn(index: number, item: Organization): string {
    return item._id;
  }
}
