import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { ExerciseTableComponent } from '../../components/exercise-table/exercise-table.component';
import {
  debounceTime,
  distinctUntilChanged,
  Observable,
  Subject,
  takeUntil,
} from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { ExerciseState } from '@features/exercises/state/exercise.state';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Exercise } from '@features/exercises/interfaces/exercise.interface';
import {
  DeleteExercise,
  GetExercisesByName,
  GetExercisesByPage,
  SetLimitPerPage,
} from '@features/exercises/state/exercise.actions';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ExerciseFormComponent } from '@features/exercises/components/exercise-form/exercise-form.component';
import { environment } from '../../../../../environments/environment';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { SnackBarService } from '@core/services/snackbar.service';
import { BtnDirective } from '@shared/directives/btn/btn.directive';
import { FiltersBarComponent } from '../../../../shared/components/filter-bar/filter-bar.component';

@Component({
  selector: 'app-exercise',
  standalone: true,
  imports: [
    ExerciseTableComponent,
    MatPaginatorModule,
    CommonModule,
    BtnDirective,
    FiltersBarComponent,
  ],
  templateUrl: './exercise.component.html',
  styleUrl: './exercise.component.css',
})
export class ExerciseComponent implements AfterViewInit, OnInit, OnDestroy {
  constructor(
    private store: Store,
    private dialog: MatDialog,
    private actions: Actions,
    private snackbar: SnackBarService,
  ) {}
  private destroy = new Subject<void>();
  limitPerPage = environment.config.pageSize ?? 8;
  pageSize = environment.config.pageSize;
  currentPage = 1;
  displayedColumns: string[] = [
    'name',
    'description',
    'type',
    'createdAt',
    'updatedAt',
    'acciones',
  ];
  dataSource = new MatTableDataSource<Exercise>();
  totalExercises$: Observable<number> = this.store.select(
    ExerciseState.totalExercises,
  );
  searchTerm$ = new Subject<string>();
  loading$: Observable<boolean> = this.store.select(
    ExerciseState.exerciseLoading,
  );
  exercises$: Observable<any[]> = this.store.select(ExerciseState.exercises);

  searchValue: string = '';
  isSearching: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.store.dispatch(
      new GetExercisesByPage({
        page: this.currentPage,
      }),
    );
    this.actions.pipe(ofActionSuccessful(GetExercisesByPage)).subscribe(() => {
      this.totalExercises$.subscribe((total) => {
        this.paginator.length = total;
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  searchExercises(searchQuery: { searchQ: string }): void {
    const searchValue = searchQuery.searchQ;

    this.isSearching = !!searchValue;
    this.store.dispatch(
      new GetExercisesByName(
        {
          page: 1,
        },
        {
          name: searchValue,
        },
      ),
    );
  }

  editExercise(e: string) {
    //TODO: Ver el error en consola al abrir el modal
    this.dialog.open(ExerciseFormComponent, {
      width: '800px',
      data: { isEdit: true, exerciseId: e },
    });
  }

  deleteExercise(e: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'Eliminar ejercicio',
        contentMessage: '¿Estás seguro de que deseas eliminar el ejercicio?',
      },
    });

    dialogRef.componentInstance.confirm.subscribe((value) => {
      if (!value) return;
      this.store.dispatch(new DeleteExercise(e));
      this.actions
        .pipe(ofActionSuccessful(DeleteExercise), takeUntil(this.destroy))
        .subscribe(() => {
          this.snackbar.showSuccess('Exito!', 'Ejercicio borrado');
          this.currentPage = 1;
          this.store
            .dispatch(new GetExercisesByPage({ page: this.currentPage }))
            .subscribe(() => {
              this.totalExercises$.subscribe((total) => {
                this.paginator.length = total;
                this.paginator.firstPage();
              });
            });
        });
    });
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

    this.store.dispatch(new SetLimitPerPage(this.limitPerPage));

    if (this.isSearching) {
      this.store.dispatch(
        new GetExercisesByName(
          {
            page: this.currentPage,
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
        }),
      );
    }
  }
}
