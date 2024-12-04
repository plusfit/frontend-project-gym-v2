import { Component, OnInit } from '@angular/core';
import { Exercise } from '@features/exercises/interfaces/exercise.interface';
import { Store } from '@ngxs/store';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FiltersBarComponent } from '@shared/components/filter-bar/filter-bar.component';
import { TableComponent } from '@shared/components/table/table.component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Observable } from 'rxjs';
import { ExerciseState } from '@features/exercises/state/exercise.state';
import {
  GetExercisesByName,
  GetExercisesByPage,
} from '@features/exercises/state/exercise.actions';
import { AsyncPipe } from '@angular/common';
import { SubRoutinesState } from '@features/sub-routines/state/sub-routine.state';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-add-exercise-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    FiltersBarComponent,
    TableComponent,
    MatPaginator,
    AsyncPipe,
  ],
  templateUrl: './add-exercise-dialog.component.html',
})
export class AddExerciseDialogComponent implements OnInit {
  exercises$!: Observable<Exercise[]>;
  totalExercises$!: Observable<number>;
  loading$!: Observable<boolean>;
  selectedExercises: Exercise[] = [];
  subRoutineExercises: Exercise[] = [];
  pageSize = environment.config.pageSize;

  constructor(
    private store: Store,
    private dialogRef: MatDialogRef<AddExerciseDialogComponent>,
  ) {}

  ngOnInit(): void {
    this.exercises$ = this.store.select(ExerciseState.exercises);
    this.totalExercises$ = this.store.select(ExerciseState.totalExercises);
    this.loading$ = this.store.select(ExerciseState.exerciseLoading);

    this.subRoutineExercises = this.store.selectSnapshot(
      SubRoutinesState.getSelectedSubRoutineExercises,
    );

    this.loadExercises(1);
  }

  loadExercises(page: number): void {
    this.store.dispatch(new GetExercisesByPage({ page }));
  }

  onSearch(filters: { searchQ: string; isActive: boolean }): void {
    this.store.dispatch(
      new GetExercisesByName({ page: 1 }, { name: filters.searchQ }),
    );
  }

  toggleExercise(element: any): void {
    this.selectedExercises = element;
  }

  addSelectedExercisesToSubRoutine(): void {
    this.dialogRef.close(this.selectedExercises);
  }

  paginate(event: PageEvent): void {
    const currentPage = event.pageIndex + 1;
    this.loadExercises(currentPage);
  }

  close(): void {
    this.dialogRef.close(null);
  }
}
