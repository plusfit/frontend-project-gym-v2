import { Component, ViewChild, OnInit, OnDestroy } from "@angular/core";
import { FiltersBarComponent } from "@shared/components/filter-bar/filter-bar.component";
import { Router } from "@angular/router";
import { Actions, ofActionSuccessful, Store } from "@ngxs/store";
import { environment } from "../../../../../environments/environment";
import { Observable, Subject, take, takeUntil } from "rxjs";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { Plan } from "@features/plans/interfaces/plan.interface";
import { PlansState } from "@features/plans/state/plan.state";
import { DeletePlan, GetClientsByPlanId, GetPlans } from "@features/plans/state/plan.actions";
import { TableComponent } from "@shared/components/table/table.component";
import { AsyncPipe } from "@angular/common";
import { SnackBarService } from "@core/services/snackbar.service";
import { ConfirmDialogComponent } from "@shared/components/confirm-dialog/confirm-dialog.component";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { FilterValues } from "@shared/interfaces/filters.interface";

@Component({
  selector: "app-plan-page",
  standalone: true,
  imports: [FiltersBarComponent, TableComponent, AsyncPipe, MatPaginator],
  templateUrl: "./plans-page.component.html",
})
export class PlansPageComponent implements OnInit, OnDestroy {
  plans!: Observable<Plan[] | null>;
  loading!: Observable<boolean | null>;
  total!: Observable<number | null>;

  displayedColumns: string[] = ["name", "type", "sexType", "createdAt", "updatedAt", "acciones"];
  pageSize: number = environment.config.pageSize;
  filterValues: FilterValues | null = null;

  private destroy = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private store: Store,
    private actions: Actions,
    private snackbar: SnackBarService,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.plans = this.store.select(PlansState.getPlans);
    this.loading = this.store.select(PlansState.isLoading);
    this.total = this.store.select(PlansState.getTotal);
    const payload = {
      page: 1,
      pageSize: this.pageSize,
    };
    this.store.dispatch(new GetPlans(payload));
  }

  paginate(pageEvent: PageEvent): void {
    const currentPage = pageEvent.pageIndex + 1;
    const currentPageSize = pageEvent.pageSize;
    const payload = {
      page: currentPage,
      pageSize: currentPageSize,
    };
    this.store.dispatch(new GetPlans(payload));
  }

  onSearch(searchQuery: { searchQ: string }): void {
    this.filterValues = {
      page: 1,
      pageSize: this.pageSize,
      searchQ: searchQuery.searchQ,
    };

    this.store.dispatch(new GetPlans({ ...this.filterValues }));
  }

  createPlan(): void {
    this.router.navigate(["/planes/crear"]);
  }

  editPlan(id: string): void {
    this.router.navigate([`/planes/${id}`]);
  }

  deletePlan(event: string): void {
    this.store.dispatch(new GetClientsByPlanId(event));
    this.actions.pipe(ofActionSuccessful(GetClientsByPlanId), take(1)).subscribe(
      () => {
        const clients = this.store.selectSnapshot(PlansState.getPlanClients);
        if (clients.length > 0) {
          this.openDialog(event, clients);
        } else {
          this.openDialog(event);
        }
      },
      (error: any) => {
        this.snackbar.showError("Error", error.error.message);
      },
    );
  }

  openDialog(plan: any, clientsList?: { email: string }[]): void {
    const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(
      ConfirmDialogComponent,
      {
        width: "500px",
        data: {
          title: "Eliminar Plan",
          contentMessage: clientsList
            ? this.parseClientListToString(clientsList)
            : "¿Estás seguro de que deseas eliminar el Plan?",
        },
      },
    );

    dialogRef.componentInstance.confirm.subscribe((value: boolean) => {
      if (!value) return;
      this.store.dispatch(new DeletePlan(plan._id));
      this.actions.pipe(ofActionSuccessful(DeletePlan), takeUntil(this.destroy)).subscribe(() => {
        this.snackbar.showSuccess("Éxito", "Plan eliminado correctamente");
      });
    });
  }

  parseClientListToString(clientsList: { email: string }[]): string {
    return (
      "El plan tiene asignado los siguientes clientes: " +
      clientsList.map((client: { email: string }) => client.email).join(", ")
    );
  }

  getSexTypeLabel(sexType: string): string {
    const sexTypeLabels: { [key: string]: string } = {
      male: "Hombre",
      female: "Mujer",
      unisex: "Unisex",
    };
    return sexTypeLabels[sexType] || sexType;
  }

  getSexTypeBadgeClass(sexType: string): string {
    const sexTypeClasses: { [key: string]: string } = {
      male: "bg-blue-100 text-blue-800",
      female: "bg-pink-100 text-pink-800",
      unisex: "bg-gray-100 text-gray-800",
    };
    return sexTypeClasses[sexType] || "bg-gray-100 text-gray-800";
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
