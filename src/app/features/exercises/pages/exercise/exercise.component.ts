import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ExerciseTableComponent } from '../../components/exercise-table/exercise-table.component';
import { debounceTime, distinctUntilChanged, Observable, Subject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { ExerciseState } from '@features/exercises/state/exercise.state';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { Store } from '@ngxs/store';
import { Exercise } from '@features/exercises/interfaces/exercise.interface';
import {
  GetExercisesByName,
  GetExercisesByPage,
} from '@features/exercises/state/exercise.actions';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-exercise',
  standalone: true,
  imports: [ExerciseTableComponent, MatPaginatorModule, CommonModule],
  templateUrl: './exercise.component.html',
  styleUrl: './exercise.component.css',
})
export class ExerciseComponent implements AfterViewInit, OnInit {
  constructor(private store: Store) {}
  limitPerPage = 8;
  currentPage = 1;
  totalExercises$: Observable<number> = this.store.select(
    ExerciseState.totalExercises,
  );
  displayedColumns: string[] = ['name', 'description', 'mode', 'acciones'];
  dataSource = new MatTableDataSource<Exercise>();
  searchTerm$ = new Subject<string>();
  loading$: Observable<boolean> = this.store.select(
    ExerciseState.exerciseLoading,
  );
  exercises$: Observable<any[]> = this.store.select(ExerciseState.exercises);

  searchValue: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.searchTerm$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(), // Solo continúa si el valor ha cambiado
      )
      .subscribe((searchValue) => {
        this.performSearch(searchValue); // Llama a la funcion que hace la busqueda
      });

    this.store.dispatch(
      new GetExercisesByPage({
        page: this.currentPage,
        limit: this.limitPerPage,
      }),
    );
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  searchExercises(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const searchValue = inputElement.value.trim();
    this.searchTerm$.next(searchValue);
  }
  performSearch(searchValue: string): void {
    this.store.dispatch(
      new GetExercisesByName(
        {
          page: this.currentPage,
          limit: this.limitPerPage,
        },
        {
          name: searchValue,
        },
      ),
    );
  }

  editExercise(exercise: Exercise) {
    console.log('Editando ejercicio:', exercise);
  }

  deleteExercise(exercise: Exercise) {
    console.log('Borrando ejercicio:', exercise);
  }
  handlePageEvent(e: PageEvent) {
    this.currentPage = e.pageIndex + 1;
    this.limitPerPage = e.pageSize;

    console.log('page', this.currentPage);
    console.log('limit', this.limitPerPage);

    this.store.dispatch(
      new GetExercisesByPage({
        page: this.currentPage,
        limit: this.limitPerPage,
      }),
    );
  }
}
