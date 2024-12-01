import { Component, OnInit } from '@angular/core';
import { SubRoutine } from '@features/sub-routines/interfaces/sub-routine.interface';
import { Store } from '@ngxs/store';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FiltersBarComponent } from '@shared/components/filter-bar/filter-bar.component';
import { TableComponent } from '@shared/components/table/table.component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Observable } from 'rxjs';
import { SubRoutinesState } from '@features/sub-routines/state/sub-routine.state';
import { RoutineState } from '@features/routines/state/routine.state';
import { GetSubRoutines } from '@features/sub-routines/state/sub-routine.actions';
import { AsyncPipe } from '@angular/common';
import { environment } from '../../../../../environments/environment';
import { Routine } from '@features/routines/interfaces/routine.interface';

@Component({
  selector: 'app-add-subrutine-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    FiltersBarComponent,
    TableComponent,
    MatPaginator,
    AsyncPipe,
  ],
  templateUrl: './add-subrutine-dialog.component.html',
})
export class AddSubroutineDialogComponent implements OnInit {
  subrutines$!: Observable<SubRoutine[]>;
  totalSubrutines$!: Observable<number>;
  loading$!: Observable<boolean>;
  selectedSubroutines: SubRoutine[] = [];
  subRoutines: SubRoutine[] = [];
  pageSize = environment.config.pageSize;
  selectedRoutine!: Routine | null;

  constructor(
    private store: Store,
    private dialogRef: MatDialogRef<AddSubroutineDialogComponent>,
  ) {}

  ngOnInit(): void {
    //datos de las subrutinas para tabla
    this.subrutines$ = this.store.select(SubRoutinesState.getSubRoutines);
    this.totalSubrutines$ = this.store.select(SubRoutinesState.getTotal);
    //fin datos de las subrutinas para tabla

    this.loading$ = this.store.select(SubRoutinesState.isLoading);
    if (this.selectedRoutine) {
      this.subRoutines = this.store.selectSnapshot(RoutineState.subRoutines);
    }
    this.loadSubrutines(1);
  }

  loadSubrutines(page: number): void {
    this.store.dispatch(
      new GetSubRoutines({ page: page, pageSize: this.pageSize }),
    );
  }

  onSearch(filters: { searchQ: string; isActive: boolean }): void {
    this.store.dispatch(
      new GetSubRoutines({
        page: 1,
        searchQ: filters.searchQ,
        pageSize: this.pageSize,
      }),
    );
  }

  toggleRoutine(element: any): void {
    this.selectedSubroutines = element;
  }

  addSelectedSubroutinesToRoutine(): void {
    this.dialogRef.close(this.selectedSubroutines);
  }

  paginate(event: PageEvent): void {
    const currentPage = event.pageIndex + 1;
    this.loadSubrutines(currentPage);
  }

  close(): void {
    this.dialogRef.close(null);
  }
}
