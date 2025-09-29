import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { Router } from "@angular/router";
import {
  AddAvailableDays,
  DeleteClient,
  GetClients,
  ToggleDisabledClient,
} from "@features/client/state/clients.actions";
import { Actions, Store, ofActionSuccessful } from "@ngxs/store";
import {
  ConfirmDialogComponent,
  DialogType,
} from "@shared/components/confirm-dialog/confirm-dialog.component";
import { environment } from "../../../../../environments/environment";
import { FiltersBarComponent } from "../../../../shared/components/filter-bar/filter-bar.component";
import { Observable, Subject, takeUntil } from "rxjs";
import { Client } from "@features/client/interface/clients.interface";
import { AsyncPipe } from "@angular/common";
import { ClientsState } from "@features/client/state/clients.state";
import { AddPaymentDialogComponent } from "../../components/add-payment-dialog/add-payment-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { SnackBarService } from "@core/services/snackbar.service";
import { FilterSelectComponent } from "../../../../shared/components/filter-select/filter-select.component";
import { TableComponent } from "../../../../shared/components/table/table.component";

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
  displayedColumns: string[] = [
    "userInfo.name",
    "userInfo.CI",
    "email",
    "lastAccess",
    "estadoPago",
    "acciones",
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
    this.filterValues = {
      page: 1,
      pageSize: this.pageSize,
      searchQ: "",
      withoutPlan: false,
      disabled: false,
      role: "User",
    };
    this.store.dispatch(new GetClients(this.filterValues));

    // Escuchar cambios en el control de filtro
    this.filterControl.valueChanges.pipe(takeUntil(this.destroy)).subscribe((value) => {
      if (value !== null) {
        this.applyFilterFromControl(value);
      }
    });
  }

  paginate(pageEvent: PageEvent): void {
    const currentPage = pageEvent.pageIndex + 1;
    const currentPageSize = pageEvent.pageSize;

    this.filterValues = {
      ...this.filterValues,
      page: currentPage,
      pageSize: currentPageSize,
    };

    this.store.dispatch(new GetClients(this.filterValues));
  }

  onSearch(searchQuery: { searchQ: string }): void {
    this.filterValues = {
      ...this.filterValues,
      page: 1,
      searchQ: searchQuery.searchQ,
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

  private applyFilterFromControl(selectedValue: string): void {
    let withoutPlan = false;
    let disabled = false;

    if (selectedValue === "disabled") {
      disabled = true;
    } else if (selectedValue === "withoutPlan") {
      withoutPlan = true;
    }

    this.filterValues = {
      ...this.filterValues,
      page: 1,
      withoutPlan,
      disabled,
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

  addPayment(client: any): void {
    const dialogRef = this.dialog.open(AddPaymentDialogComponent, {
      width: "500px",
      data: {
        clientName: client.userInfo?.name || "Cliente",
        clientId: client._id || client.id,
      },
    });

    dialogRef.componentInstance.confirm.subscribe((result) => {
      if (result) {
        this.store.dispatch(new AddAvailableDays(result.clientId, result.days));
        this.actions
          .pipe(ofActionSuccessful(AddAvailableDays), takeUntil(this.destroy))
          .subscribe(() => {
            this.store.dispatch(new GetClients(this.filterValues));
          });
      }
    });
  }

  toggleDisabledClient(event: any, disabled: boolean): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "500px",
      data: {
        title: `${disabled ? "Habilitar" : "Deshabilitar"} cliente`,
        contentMessage: `¿Estás seguro que desea ${disabled ? "habilitar" : "deshabilitar"} este cliente?`,
        type: disabled ? DialogType.ENABLE_CLIENT : DialogType.DISABLE_CLIENT,
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
        title: "Eliminar cliente",
        contentMessage:
          "¿Estás seguro que deseas eliminar este cliente? Esta acción no se puede deshacer y se eliminarán todos sus datos asociados.",
        type: DialogType.DELETE_CLIENT,
      },
    });

    dialogRef.componentInstance.confirm.subscribe((value) => {
      if (!value) return;
      const id = event?._id || event?.id || event; // pass only the id
      this.store.dispatch(new DeleteClient(id));
      this.actions.pipe(ofActionSuccessful(DeleteClient), takeUntil(this.destroy)).subscribe(() => {
        this.snackbar.showSuccess("Éxito", "Cliente eliminado");
      });
      this.actions.pipe(ofActionSuccessful(DeleteClient), takeUntil(this.destroy)).subscribe(() => {
        this.snackbar.showSuccess("Éxito", "Cliente eliminado");
      });
    });
  }

  getPaymentStatus(client: Client & { availableDays?: number }): { text: string; class: string } {
    const availableDays = client.availableDays || 0;
    if (availableDays > 0) {
      return {
        text: "Al día",
        class: "text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs font-medium",
      };
    }

    return {
      text: "Atrasado",
      class: "text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs font-medium",
    };
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
