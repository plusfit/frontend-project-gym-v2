import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { FiltersBarComponent } from '@shared/components/filter-bar/filter-bar.component';
import { Router } from '@angular/router';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { environment } from '../../../../../environments/environment';
import { Observable, Subject, takeUntil } from 'rxjs';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Plan } from '@features/plans/interfaces/plan.interface';
import { PlansState } from '@features/plans/state/plan.state';
import { DeletePlan, GetPlans } from '@features/plans/state/plan.actions';
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
  deletePlan(event: any): void {
    console.log(event);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'Eliminar Plan',
        contentMessage: '¿Estás seguro de que deseas eliminar el Plan?',
      },
    });

    dialogRef.componentInstance.confirm.subscribe((value) => {
      if (!value) return;
      this.store.dispatch(new DeletePlan(event));
      this.actions
        .pipe(ofActionSuccessful(DeletePlan), takeUntil(this.destroy))
        .subscribe(() => {
          this.snackbar.showSuccess('Éxito', 'Plan eliminado correctamente');
        });
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
