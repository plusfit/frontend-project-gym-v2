import { AfterViewInit, Component, ViewChild, OnInit } from '@angular/core';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Exercise } from '../../interfaces/exercise.interface';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ExerciseState } from '@features/exercises/state/exercise.state';
import { Store } from '@ngxs/store';
import { GetExercisesByPage } from '@features/exercises/state/exercise.actions';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../../shared/components/table/table.component';

@Component({
  selector: 'app-exercise-table',
  styleUrls: ['./exercise-table.component.css'],
  templateUrl: './exercise-table.component.html',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    TableComponent,
  ],
})
export class ExerciseTableComponent implements AfterViewInit, OnInit {
  constructor(private store: Store) {}
  limitPerPage = 8;
  page = 1;
  totalExercises$: Observable<number> = this.store.select(
    ExerciseState.totalExercises,
  );
  displayedColumns: string[] = [
    'name',
    'description',
    'mode',
    'options',
    'isActive',
    'acciones',
  ];
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
      new GetExercisesByPage({ page: this.page, limit: this.limitPerPage }),
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
    this.dataSource.filter = searchValue.trim().toLowerCase();
    this.store
      .dispatch(
        new GetExercisesByPage({ page: this.page, limit: this.limitPerPage }),
      )
      .subscribe(
        (data) => {
          console.log('Data:', data);
        },
        (error) => {
          console.error('Error:', error);
        },
      );
  }

  editExercise(exercise: Exercise) {
    console.log('Editando ejercicio:', exercise);
  }

  deleteExercise(exercise: Exercise) {
    console.log('Borrando ejercicio:', exercise);
  }
  handlePageEvent(e: PageEvent) {
    this.page = e.pageIndex;
    this.limitPerPage = e.pageSize;
  }
}
