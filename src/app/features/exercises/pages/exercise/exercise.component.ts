import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { SnackBarService } from "@core/services/snackbar.service";
import { ExerciseFormComponent } from "@features/exercises/components/exercise-form/exercise-form.component";
import { Exercise } from "@features/exercises/interfaces/exercise.interface";
import {
  DeleteExercise,
  GetExercisesByName,
  GetExercisesByPage,
  SetLimitPerPage,
} from "@features/exercises/state/exercise.actions";
import { ExerciseState } from "@features/exercises/state/exercise.state";
import { Actions, Store, ofActionSuccessful } from "@ngxs/store";
import {
  ConfirmDialogComponent,
  DialogType,
} from "@shared/components/confirm-dialog/confirm-dialog.component";
import { BtnDirective } from "@shared/directives/btn/btn.directive";
import { Observable, Subject, takeUntil } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { FiltersBarComponent } from "../../../../shared/components/filter-bar/filter-bar.component";
import { ExerciseTableComponent } from "../../components/exercise-table/exercise-table.component";

@Component({
  selector: "app-exercise",
  standalone: true,
  imports: [
    ExerciseTableComponent,
    MatPaginatorModule,
    CommonModule,
    BtnDirective,
    FiltersBarComponent,
  ],
  templateUrl: "./exercise.component.html",
  styleUrls: ["./exercise.component.css"],
})
export class ExerciseComponent implements AfterViewInit, OnInit, OnDestroy {
  private destroy: Subject<void> = new Subject<void>();

  limitPerPage: number = environment.config.pageSize ?? 8;
  pageSize: number = environment.config.pageSize ?? 8;
  currentPage: number = 1;

  displayedColumns: string[] = [
    "name",
    "description",
    "type",
    "category",
    "createdAt",
    "updatedAt",
    "acciones",
  ];

  dataSource: MatTableDataSource<Exercise> = new MatTableDataSource<Exercise>();
  totalExercises$: Observable<number> = this.store.select(
    ExerciseState.totalExercises,
  );
  loading$: Observable<boolean> = this.store.select(
    ExerciseState.exerciseLoading,
  );
  exercises$: Observable<Exercise[]> = this.store.select(
    ExerciseState.exercises,
  );

  searchValue: string = "";
  isSearching: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private actions: Actions,
    private snackbar: SnackBarService,
  ) {}

  ngOnInit(): void {
    this.store.dispatch(
      new GetExercisesByPage({
        page: this.currentPage,
      }),
    );

    this.actions.pipe(ofActionSuccessful(GetExercisesByPage)).subscribe(() => {
      this.totalExercises$.subscribe((total) => {
        if (this.paginator) {
          this.paginator.length = total;
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  searchExercises(searchQuery: { searchQ: string }): void {
    const searchValue: string = searchQuery.searchQ;
    this.isSearching = !!searchValue;
    this.searchValue = searchValue;

    this.store.dispatch(
      new GetExercisesByName(
        {
          page: 1,
        },
        {
          name: searchValue,
          type: searchValue,
          category: searchValue,
        },
      ),
    );
  }

  editExercise(exerciseId: string): void {
    this.dialog.open(ExerciseFormComponent, {
      width: "800px",
      data: { isEdit: true, exerciseId },
    });
  }

  deleteExercise(exercise: { id: string; gifUrl: string }): void {
    const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(
      ConfirmDialogComponent,
      {
        width: "500px",
        data: {
          title: "Eliminar ejercicio",
          contentMessage:
            "¿Estás seguro de que deseas eliminar el ejercicio? Esta acción no se puede deshacer.",
          type: DialogType.DELETE_EXERCISE,
        },
      },
    );

    dialogRef.componentInstance.confirm.subscribe((value: boolean) => {
      if (!value) return;
      this.store.dispatch(new DeleteExercise(exercise.id, exercise.gifUrl));

      this.actions
        .pipe(ofActionSuccessful(DeleteExercise), takeUntil(this.destroy))
        .subscribe(() => {
          this.snackbar.showSuccess("Éxito!", "Ejercicio borrado");
          this.currentPage = 1;
          this.store
            .dispatch(new GetExercisesByPage({ page: this.currentPage }))
            .subscribe(() => {
              this.totalExercises$.subscribe((total) => {
                if (this.paginator) {
                  this.paginator.length = total;
                  this.paginator.firstPage();
                }
              });
            });
        });
    });
  }

  addExerciseModal(): void {
    this.dialog.open(ExerciseFormComponent, {
      width: "800px",
      data: { isEdit: false },
    });
  }

  handlePageEvent(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.limitPerPage = event.pageSize;

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
