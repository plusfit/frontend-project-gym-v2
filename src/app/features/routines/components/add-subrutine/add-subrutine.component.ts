import { Component, OnInit } from '@angular/core';
import { SubRoutine } from '@features/sub-routines/interfaces/sub-routine.interface';
import { Store } from '@ngxs/store';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FiltersBarComponent } from '@shared/components/filter-bar/filter-bar.component';
import { TableComponent } from '@shared/components/table/table.component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Observable } from 'rxjs';
import { SubRoutinesState } from '@features/sub-routines/state/sub-routine.state';
import {
  GetSubrutinesByName,
  GetSubRoutines,
} from '@features/exercises/state/exercise.actions';
import { AsyncPipe } from '@angular/common';
import { SubRoutinesState } from '@features/sub-routines/state/sub-routine.state';
import {environment} from "../../../../../environments/environment";

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
export class AddSubrutineDialogComponent implements OnInit {
  subrutines$!: Observable<SubRoutine[]>;
  totalSubrutines$!: Observable<number>;
  loading$!: Observable<boolean>;
  selectedSubrutines: SubRoutine[] = [];
  subRoutineSubrutines: SubRoutine[] = [];
  pageSize = environment.config.pageSize;

  constructor(
    private store: Store,
    private dialogRef: MatDialogRef<AddSubrutineDialogComponent>,
  ) {}

  ngOnInit(): void {
    //datos de las subrutinas
    this.subrutines$ = this.store.select(SubRoutinesState.subrutines);
    this.totalSubrutines$ = this.store.select(SubRoutinesState.totalSubrutines);
    this.loading$ = this.store.select(SubRoutinesState.exerciseLoading);

    this.subRoutineSubrutines = this.store.selectSnapshot(
      SubRoutinesState.selectedSubRoutine,
    );

    this.loadSubrutines(1);
  }

  loadSubrutines(page: number): void {
    this.store.dispatch(new GetSubRoutines({ page }));
  }

  onSearch(filters: { searchQ: string; isActive: boolean }): void {
    this.store.dispatch(
      new GetSubrutinesByName({ page: 1 }, { name: filters.searchQ }),
    );
  }

  toggleExercise(element: any): void {
    console.log(element);
    this.selectedSubrutines = element;
  }

  addSelectedSubrutinesToSubRoutine(): void {
    const selectedSubRoutine = this.store.selectSnapshot(
      SubRoutinesState.getSelectedSubRoutine,
    );

    const newSubrutines = this.selectedSubrutines.filter(
      (exercise) =>
        !this.subRoutineSubrutines.some(
          (subRoutineExercise) => subRoutineExercise._id === exercise._id,
        ),
    );

    const newSelectedSubRoutine = {
      ...selectedSubRoutine,
      subrutines: newSubrutines,
    };
    this.dialogRef.close(newSelectedSubRoutine);
  }

  paginate(event: PageEvent): void {
    const currentPage = event.pageIndex + 1;
    this.loadSubrutines(currentPage);
  }

  close(): void {
    this.dialogRef.close(null);
  }
}
