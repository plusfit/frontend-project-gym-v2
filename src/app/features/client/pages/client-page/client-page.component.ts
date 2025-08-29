import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { Router } from "@angular/router";
import {
  DeleteClient,
  GetClients,
  ToggleDisabledClient,
} from "@features/client/state/clients.actions";
import { Actions, ofActionSuccessful, Store } from "@ngxs/store";
import { environment } from "../../../../../environments/environment";
import { FiltersBarComponent } from "../../../../shared/components/filter-bar/filter-bar.component";
import { TableComponent } from "../../../../shared/components/table/table.component";
import { Observable, Subject, takeUntil } from "rxjs";
import { Client } from "@features/client/interface/clients.interface";
import { AsyncPipe } from "@angular/common";
import { ClientsState } from "@features/client/state/clients.state";
import { ConfirmDialogComponent } from "@shared/components/confirm-dialog/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { SnackBarService } from "@core/services/snackbar.service";
import { FilterSelectComponent } from "../../../../shared/components/filter-select/filter-select.component";
import { FormControl } from "@angular/forms";

@Component({
  selector: "app-client-page",
  standalone: true,
  imports: [FiltersBarComponent, TableComponent, MatPaginator, AsyncPipe, FilterSelectComponent],
  templateUrl: "./client-page.component.html",
  styleUrl: "./client-page.component.css",
})
export class ClientPageComponent implements OnInit, OnDestroy {
  clients!: Observable<Client[] | null>;
  loading!: Observable<boolean | null>;
  total!: Observable<number | null>;
  filterControl = new FormControl("all");

  pageSize = environment.config.pageSize;
  filterValues: any | null = null;
  displayedColumns: string[] = ["userInfo.name", "userInfo.CI", "email", "lastAccess", "acciones"];

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
    this.filterValues = {
      page: 1,
      pageSize: this.pageSize,
      searchQ: "",
      withoutPlan: false,
      disabled: false,
      role: "User",
    };
    this.store.dispatch(new GetClients(this.filterValues));
  }

  paginate(pageEvent: PageEvent): void {
    const currentPage = pageEvent.pageIndex + 1;
    const currentPageSize = pageEvent.pageSize;

    this.filterValues = {
      ...this.filterValues,
      page: currentPage,
      pageSize: currentPageSize,
      searchQ: this.filterValues.searchQ,
      withoutPlan: this.filterControl.value === "true" ? true : false,
    };

    this.store.dispatch(new GetClients(this.filterValues));
  }

  onSearch(searchQuery: { searchQ: string }): void {
    this.filterValues = {
      ...this.filterValues,
      page: 1,
      pageSize: this.pageSize,
      searchQ: searchQuery.searchQ,
      withoutPlan: this.filterControl.value === "true" ? true : false,
    };

    this.store.dispatch(new GetClients(this.filterValues));
  }

  onFilterChange(filters: { withoutPlan: boolean; disabled: boolean }): void {
    this.filterValues = {
      ...this.filterValues,
      page: 1,
      withoutPlan: filters.withoutPlan,
      disabled: filters.disabled,
    };

    this.store.dispatch(new GetClients(this.filterValues));
  }

  createClient(): void {
    this.router.navigate(["/clientes/crear"]);
  }

  editClient(id: string): void {
    this.router.navigate([`/clientes/${id}`]);
  }

  seeDetailClient(id: string): void {
    this.router.navigate([`/clientes/detalle/${id}`]);
  }

  toggleDisabledClient(event: any, disabled: boolean): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "500px",
      data: {
        title: `${disabled ? "Habilitar" : "Deshabilitar"} cliente`,
        contentMessage: `¿Estás seguro que desea ${disabled ? "habilitar" : "deshabilitar"} cliente?`,
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
            "Exito",
            `Cliente ${disabled ? "hablitado" : "deshabilitado"} correctamente`,
          );
        });
    });
  }

  deleteClient(event: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "500px",
      data: {
        title: 'Eliminar cliente',
        contentMessage: '¿Estás seguro que deseas eliminar este cliente?',
      },
    });

    dialogRef.componentInstance.confirm.subscribe((value) => {
      if (!value) return;
      const id = event?._id || event?.id || event; // pass only the id
      this.store.dispatch(new DeleteClient(id));
      this.actions
        .pipe(ofActionSuccessful(DeleteClient), takeUntil(this.destroy))
        .subscribe(() => {
          this.snackbar.showSuccess('Éxito', 'Cliente eliminado');
        });
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  /**
   * Get the count of active clients
   */
  getActiveClientsCount(): number {
    // Por ahora retornamos un valor fijo, puedes implementar lógica específica
    return 45; // Placeholder - implementar lógica real según tu estructura de datos
  }

  /**
   * Get the count of inactive clients
   */
  getInactiveClientsCount(): number {
    // Por ahora retornamos un valor fijo
    return 12; // Placeholder - implementar lógica real según tu estructura de datos
  }

  /**
   * Get the total count of clients
   */
  getTotalClientsCount(): number {
    // Por ahora retornamos un valor fijo
    return 57; // Placeholder - implementar lógica real según tu estructura de datos
  }
}
