import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { FiltersBarComponent } from '@shared/components/filter-bar/filter-bar.component';
import { Router } from '@angular/router';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { environment } from '../../../../../environments/environment';
import { Observable, Subject, takeUntil } from 'rxjs';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SubRoutine } from '@features/sub-routines/interfaces/sub-routine.interface';
import { SubRoutinesState } from '@features/sub-routines/state/sub-routine.state';
import {
  DeleteSubRoutine,
  GetSubRoutines,
} from '@features/sub-routines/state/sub-routine.actions';
import { TableComponent } from '@shared/components/table/table.component';
import { AsyncPipe } from '@angular/common';
import { SnackBarService } from '@core/services/snackbar.service';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-sub-routine-page',
  standalone: true,
  imports: [FiltersBarComponent, TableComponent, AsyncPipe, MatPaginator],
  templateUrl: './sub-routine-page.component.html',
})
export class SubRoutinePageComponent implements OnInit, OnDestroy {
  subRoutines!: Observable<SubRoutine[] | null>;
  loading!: Observable<boolean | null>;
  total!: Observable<number | null>;

  displayedColumns: string[] = ['name', 'description', 'acciones']; // TODO: Change colums
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
    this.subRoutines = this.store.select(SubRoutinesState.getSubRoutines);
    this.loading = this.store.select(SubRoutinesState.isLoading);
    this.total = this.store.select(SubRoutinesState.getTotal);
    const payload = {
      page: 1,
      pageSize: this.pageSize,
    };
    this.store.dispatch(new GetSubRoutines(payload));
  }

  paginate(pageEvent: PageEvent): void {
    const currentPage = pageEvent.pageIndex + 1;
    const currentPageSize = pageEvent.pageSize;
    const payload = {
      page: currentPage,
      pageSize: currentPageSize,
    };
    this.store.dispatch(new GetSubRoutines(payload));
  }

  onSearch(searchQuery: { searchQ: string }): void {
    this.filterValues = {
      page: 1,
      pageSize: this.pageSize,
      searchQ: searchQuery.searchQ,
    };

    this.store.dispatch(new GetSubRoutines({ ...this.filterValues }));
  }

  createSubRoutine() {
    this.router.navigate(['/subrutinas/crear']);
  }

  editSubRoutine(id: any): void {
    this.router.navigate([`/subrutinas/${id}`]);
  }
  deleteSubRoutine(event: any): void {
    console.log(event);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'Eliminar Subrutina',
        contentMessage: '¿Estás seguro de que deseas eliminar la Subrutina?',
      },
    });

    dialogRef.componentInstance.confirm.subscribe((value) => {
      if (!value) return;
      this.store.dispatch(new DeleteSubRoutine(event));
      this.actions
        .pipe(ofActionSuccessful(DeleteSubRoutine), takeUntil(this.destroy))
        .subscribe(() => {
          this.snackbar.showSuccess(
            'Exito',
            'Subrutina eliminada correctamente',
          );
        });
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
