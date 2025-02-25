import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import {
  DeleteClient,
  GetClients,
} from '@features/client/state/clients.actions';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { environment } from '../../../../../environments/environment';
import { FiltersBarComponent } from '../../../../shared/components/filter-bar/filter-bar.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Client } from '@features/client/interface/clients.interface';
import { AsyncPipe } from '@angular/common';
import { ClientsState } from '@features/client/state/clients.state';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SnackBarService } from '@core/services/snackbar.service';
import { FilterSelectComponent } from '../../../../shared/components/filter-select/filter-select.component';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-client-page',
  standalone: true,
  imports: [
    FiltersBarComponent,
    TableComponent,
    MatPaginator,
    AsyncPipe,
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
  ) {}

  ngOnInit(): void {
    this.clients = this.store.select(ClientsState.getClients);
    this.loading = this.store.select(ClientsState.isLoading);
    this.total = this.store.select(ClientsState.getTotal);
    this.store.dispatch(new GetClients({ page: 1, pageSize: this.pageSize }));
  }

  paginate(pageEvent: PageEvent): void {
    const currentPage = pageEvent.pageIndex + 1;
    const currentPageSize = pageEvent.pageSize;
    const payload = {
      page: currentPage,
      pageSize: currentPageSize,
      withoutPlan: this.filterControl.value === 'true' ? true : false,
    };
    this.store.dispatch(new GetClients(payload));
  }

  onSearch(searchQuery: { searchQ: string }): void {
    this.filterValues = {
      page: 1,
      pageSize: this.pageSize,
      searchQ: searchQuery.searchQ,
      withoutPlan: this.filterControl.value === 'true' ? true : false,
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

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
