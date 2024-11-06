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
import { MatDialog } from '@angular/material/dialog';
import { ExerciseFormComponent } from '@features/exercises/components/exercise-form/exercise-form.component';
@Component({
  selector: 'app-exercise',
  standalone: true,
  imports: [ExerciseTableComponent, MatPaginatorModule, CommonModule],
  templateUrl: './exercise.component.html',
  styleUrl: './exercise.component.css',
})
export class ExerciseComponent implements AfterViewInit, OnInit {
  constructor(
    private store: Store,
    private dialog: MatDialog,
  ) {}
  limitPerPage = 8;
  currentPage = 1;
  totalExercises$: Observable<number> = this.store.select(
    ExerciseState.totalExercises,
  );
  displayedColumns: string[] = ['name', 'description', 'type', 'acciones'];
  dataSource = new MatTableDataSource<Exercise>();
  searchTerm$ = new Subject<string>();
  loading$: Observable<boolean> = this.store.select(
    ExerciseState.exerciseLoading,
  );
  exercises$: Observable<any[]> = this.store.select(ExerciseState.exercises);

  searchValue: string = '';
  isSearching: boolean = false;

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
    this.searchValue = inputElement.value.trim();
    this.searchTerm$.next(this.searchValue);
  }
  performSearch(searchValue: string): void {
    this.isSearching = !!searchValue;
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
    this.dialog.open(ExerciseFormComponent, {
      width: '800px',
      data: { isEdit: true, exercise },
    });
  }

  deleteExercise(exercise: Exercise) {
    console.log('Borrando ejercicio:', exercise);
  }

  addExerciseModal() {
    this.dialog.open(ExerciseFormComponent, {
      width: '800px',
      data: { isEdit: false },
    });
  }

  handlePageEvent(e: PageEvent) {
    this.currentPage = e.pageIndex + 1;
    this.limitPerPage = e.pageSize;

    if (this.isSearching) {
      this.store.dispatch(
        new GetExercisesByName(
          {
            page: this.currentPage,
            limit: this.limitPerPage,
          },
          {
            name: this.searchValue,
          },
        ),
      );
    } else {
      this.store.dispatch(
        new GetExercisesByPage({
          page: this.currentPage,
          limit: this.limitPerPage,
        }),
      );
    }
  }
}
