import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import {
  DeleteClient,
  GetClients,
  ToggleDisabledClient,
} from '@features/client/state/clients.actions';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { environment } from '../../../../../environments/environment';
import { FiltersBarComponent } from '../../../../shared/components/filter-bar/filter-bar.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Client } from '@features/client/interface/clients.interface';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ClientsState } from '@features/client/state/clients.state';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SnackBarService } from '@core/services/snackbar.service';
import { FilterSelectComponent } from '../../../../shared/components/filter-select/filter-select.component';
import { FormControl } from '@angular/forms';
import { OrganizationsService } from '@features/organizations/services/organizations.service';
import { OrganizationClientStats } from '@features/organizations/interfaces/organization.interface';

@Component({
  selector: 'app-client-page',
  standalone: true,
  imports: [
    FiltersBarComponent,
    TableComponent,
    MatPaginator,
    AsyncPipe,
    CommonModule,
    FilterSelectComponent,
  ],
  templateUrl: './client-page.component.html',
  styleUrl: './client-page.component.css',
})
export class ClientPageComponent implements OnInit, OnDestroy {
  clients!: Observable<Client[] | null>;
  loading!: Observable<boolean | null>;
  total!: Observable<number | null>;
  filterControl = new FormControl('all');

  // Estadísticas de clientes
  clientStats: OrganizationClientStats | null = null;
  loadingStats = false;

  pageSize = environment.config.pageSize;
  filterValues: any | null = null;
  displayedColumns: string[] = [
    'userInfo.name',
    'userInfo.CI',
    'email',
    'acciones',
  ];

  private destroy = new Subject<void>();

  constructor(
    private store: Store,
    private actions: Actions,
    private router: Router,
    private dialog: MatDialog,
    private snackbar: SnackBarService,
    private organizationsService: OrganizationsService,
  ) {}

  ngOnInit(): void {
    this.clients = this.store.select(ClientsState.getClients);
    this.loading = this.store.select(ClientsState.isLoading);
    this.total = this.store.select(ClientsState.getTotal);
    this.filterValues = {
      page: 1,
      pageSize: this.pageSize,
      searchQ: '',
      withoutPlan: false,
      disable: false,
    };
    this.store.dispatch(new GetClients(this.filterValues));
    
    // Cargar estadísticas de demo por ahora
    this.loadClientStats();
  }

  private loadClientStats(): void {
    // Demo data con valores más realistas para mostrar diferentes estados
    const currentClients = 47;
    const maxClients = 50;
    const available = maxClients - currentClients;
    const percentage = Math.round((currentClients / maxClients) * 100);
    
    this.clientStats = {
      currentClients,
      maxClients,
      available,
      percentage
    };
  }

  paginate(pageEvent: PageEvent): void {
    const currentPage = pageEvent.pageIndex + 1;
    const currentPageSize = pageEvent.pageSize;
    const payload = {
      page: currentPage,
      pageSize: currentPageSize,
      searchQ: this.filterValues.searchQ,
      withoutPlan: this.filterControl.value === 'true',
    };
    this.store.dispatch(new GetClients(payload));
  }

  onSearch(searchQuery: { searchQ: string }): void {
    this.filterValues = {
      page: 1,
      pageSize: this.pageSize,
      searchQ: searchQuery.searchQ,
      withoutPlan: this.filterControl.value === 'true',
    };

    this.store.dispatch(new GetClients({ ...this.filterValues }));
  }

  createClient(): void {
    this.router.navigate(['/clientes/crear']);
  }

  editClient(id: string): void {
    this.router.navigate([`/clientes/${id}`]);
  }

  seeDetailClient(id: string): void {
    this.router.navigate([`/clientes/detalle/${id}`]);
  }

  toggleDisabledClient(event: any, disabled: boolean): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: `${disabled ? 'Habilitar' : 'Deshabilitar'} cliente`,
        contentMessage: `¿Estás seguro que desea ${disabled ? 'habilitar' : 'deshabilitar'} cliente?`,
      },
    });

    dialogRef.componentInstance.confirm.subscribe((value) => {
      if (!value) return;
      const toggleDisabled = !disabled;
      this.store.dispatch(new ToggleDisabledClient(event.id, toggleDisabled));
      this.actions
        .pipe(ofActionSuccessful(ToggleDisabledClient), takeUntil(this.destroy))
        .subscribe(() => {
          this.snackbar.showSuccess(
            'Exito',
            `Cliente ${disabled ? 'hablitado' : 'deshabilitado'} correctamente`,
          );
        });
    });
  }

  deleteClient(event: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'Eliminar cliente',
        contentMessage: '¿Estás seguro que desea eliminar cliente?',
      },
    });

    dialogRef.componentInstance.confirm.subscribe((value) => {
      if (!value) return;
      this.store.dispatch(new DeleteClient(event));
      this.actions
        .pipe(ofActionSuccessful(DeleteClient), takeUntil(this.destroy))
        .subscribe(() => {
          this.snackbar.showSuccess('Exito', 'Cliente eliminado correctamente');
        });
    });
  }

  getProgressBarColor(percentage: number): string {
    if (percentage <= 60) return 'bg-gradient-to-r from-green-400 to-green-500';
    if (percentage <= 75) return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
    if (percentage <= 90) return 'bg-gradient-to-r from-orange-400 to-orange-500';
    return 'bg-gradient-to-r from-red-400 to-red-500';
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
