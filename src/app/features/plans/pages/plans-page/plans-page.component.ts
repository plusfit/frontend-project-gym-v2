import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { FiltersBarComponent } from '@shared/components/filter-bar/filter-bar.component';
import { Router } from '@angular/router';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { environment } from '../../../../../environments/environment';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Plan } from '@features/plans/interfaces/plan.interface';
import { PlansState } from '@features/plans/state/plan.state';
import {
  DeletePlan,
  GetClientsByPlanId,
  GetPlans,
} from '@features/plans/state/plan.actions';
import { TableComponent } from '@shared/components/table/table.component';
import { AsyncPipe } from '@angular/common';
import { SnackBarService } from '@core/services/snackbar.service';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-plan-page',
  standalone: true,
  imports: [FiltersBarComponent, TableComponent, AsyncPipe, MatPaginator],
  templateUrl: './plans-page.component.html',
})
export class PlansPageComponent implements OnInit, OnDestroy {
  plans!: Observable<Plan[] | null>;
  loading!: Observable<boolean | null>;
  total!: Observable<number | null>;

  displayedColumns: string[] = ['name', 'type', 'acciones'];
  pageSize = environment.config.pageSize;
  filterValues: any | null = null;

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

  createPlan() {
    this.router.navigate(['/planes/crear']);
  }

  editPlan(id: any): void {
    this.router.navigate([`/planes/${id}`]);
  }
  // TODO: Improve this, creating a new dialog component to show the clients list
  deletePlan(event: any): void {
    this.store.dispatch(new GetClientsByPlanId(event));
    this.actions
      .pipe(ofActionSuccessful(GetClientsByPlanId), take(1))
      .subscribe(
        () => {
          const clients = this.store.selectSnapshot(PlansState.getPlanClients);
          if (clients.length > 0) {
            this.openDialog(event, clients);
          } else {
            this.openDialog(event);
          }
        },
        (error) => {
          this.snackbar.showError('Error', error.error.message);
        },
      );
  }

  openDialog(id: any, clientsList?: any[]): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'Eliminar Plan',
        contentMessage: clientsList
          ? this.parseClientListToString(clientsList)
          : '¿Estás seguro de que deseas eliminar el Plan?',
      },
    });

    dialogRef.componentInstance.confirm.subscribe((value) => {
      if (!value) return;
      this.store.dispatch(new DeletePlan(id));
      this.actions
        .pipe(ofActionSuccessful(DeletePlan), takeUntil(this.destroy))
        .subscribe(() => {
          this.snackbar.showSuccess('Éxito', 'Plan eliminado correctamente');
        });
    });
  }

  parseClientListToString(clientsList: any): string {
    return (
      'El plan tiene asignado los siguientes clientes: ' +
      clientsList.map((client: any) => client.email).join(', ')
    );
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
