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
  GetSubRoutine,
  GetSubRoutines,
} from '@features/sub-routines/state/sub-routine.actions';
import { TableComponent } from '@shared/components/table/table.component';
import { AsyncPipe } from '@angular/common';
import { SnackBarService } from '@core/services/snackbar.service';

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

  displayedColumns: string[] = ['name', 'isCustom', 'exercises', 'acciones']; // TODO: Change colums
  pageSize = environment.config.pageSize;
  defaultSort = 'name desc';
  filterValues: any | null = null;

  private destroy = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private store: Store,
    private actions: Actions,
    private snackbar: SnackBarService,
    private router: Router,
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
    this.router.navigate(['/sub-rutinas/create']);
  }

  editSubRoutine(id: any): void {
    this.router.navigate([`/sub-rutinas/${id}`]);
  }
  deleteSubRoutine(event: any): void {
    this.store.dispatch(new DeleteSubRoutine(event));
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
