import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { SnackBarService } from '@core/services/snackbar.service';
import { Routine } from '@features/routines/interfaces/routine.interface';
import { GetRoutinesBySubRoutine } from '@features/routines/state/routine.actions';
import { RoutineState } from '@features/routines/state/routine.state';
import { SubRoutine } from '@features/sub-routines/interfaces/sub-routine.interface';
import {
  DeleteSubRoutine,
  GetSubRoutines,
} from '@features/sub-routines/state/sub-routine.actions';
import { SubRoutinesState } from '@features/sub-routines/state/sub-routine.state';
import { Actions, Store, ofActionSuccessful } from '@ngxs/store';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { FiltersBarComponent } from '@shared/components/filter-bar/filter-bar.component';
import { TableComponent } from '@shared/components/table/table.component';
import { FilterValues } from '@shared/interfaces/filters.interface';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { environment } from '../../../../../environments/environment';

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

  displayedColumns: string[] = [
    'name',
    'description',
    'category',
    'createdAt',
    'updatedAt',
    'acciones',
  ];
  pageSize = environment.config.pageSize;
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

  editSubRoutine(id: string): void {
    this.router.navigate([`/subrutinas/${id}`]);
  }
  deleteSubRoutine(event: SubRoutine): void {
    if(!event._id) return;
    this.store.dispatch(new GetRoutinesBySubRoutine(event._id));
    this.actions
      .pipe(ofActionSuccessful(GetRoutinesBySubRoutine), take(1))
      .subscribe(
        () => {
          const routines = this.store.selectSnapshot(
            RoutineState.affectedRoutines,
          );
          if (routines.length > 0) {
            this.openDialog(event, routines);
          } else {
            this.openDialog(event);
          }
        },
        (error: any) => {
          this.snackbar.showError('Error', error.error.message);
        },
      );
  }
  openDialog(subRoutine: SubRoutine, routineList?: Routine[]): void {
    const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(
      ConfirmDialogComponent,
      {
        width: '500px',
        data: {
          title: 'Eliminar Subrutina',
          contentMessage: routineList
            ? this.parseRoutineListToString(routineList)
            : '¿Estás seguro de que deseas eliminar la Subrutina?',
          icon: 'ph-list-bullets-light',
          iconColor: 'bg-indigo-100',
          confirmButtonText: 'Eliminar'
        },
      },
    );

    dialogRef.componentInstance.confirm.subscribe((value: boolean) => {
      if (!value) return;
      if (subRoutine._id) {
        this.store.dispatch(new DeleteSubRoutine(subRoutine._id));
      }
      this.actions
        .pipe(ofActionSuccessful(DeleteSubRoutine), takeUntil(this.destroy))
        .subscribe(() => {
          this.snackbar.showSuccess(
            'Éxito',
            'Subrutina eliminada correctamente',
          );
        });
    });
  }

  parseRoutineListToString(routineList: Routine[]): string {
    return `La Subrutina esta asignada en las siguientes Rutinas: ${routineList.map((routine) => routine.name).join(', ')}`;
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
