import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SnackBarService } from '@core/services/snackbar.service';
import { Routine } from '@features/routines/interfaces/routine.interface';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { BtnDirective } from '@shared/directives/btn/btn.directive';
import {
  debounceTime,
  distinctUntilChanged,
  Observable,
  Subject,
  takeUntil,
} from 'rxjs';
import { environment } from '../../../../../environments/environment.prod';
import {
  DeleteRoutine,
  GetRoutinesByName,
  GetRoutinesByPage,
  SetLimitPerPage,
} from '@features/routines/state/routine.actions';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { RoutineState } from '@features/routines/state/routine.state';
import { RoutineTableComponent } from '@features/routines/components/routine-table/routine-table.component';
import { RoutineFormComponent } from '@features/routines/components/routine-form/routine-form.component';

@Component({
  selector: 'app-routine',
  standalone: true,
  imports: [
    RoutineTableComponent,
    MatPaginatorModule,
    CommonModule,
    BtnDirective,
  ],
  templateUrl: './routine.component.html',
  styleUrl: './routine.component.css',
})
export class RoutinePageComponent implements AfterViewInit, OnInit, OnDestroy {
  constructor(
    private store: Store,
    private dialog: MatDialog,
    private actions: Actions,
    private snackbar: SnackBarService,
  ) {}
  private destroy = new Subject<void>();
  limitPerPage = environment.routineTableLimit ?? 8;
  routineTableLimitOptions = environment.routineTableLimitOptions;
  currentPage = 1;
  displayedColumns: string[] = [
    'name',
    'description',
    'category',
    'isCustom',
    'days',
    'acciones',
  ];
  dataSource = new MatTableDataSource<Routine>();
  totalRoutines$: Observable<number> = this.store.select(
    RoutineState.totalRoutines,
  );
  searchTerm$ = new Subject<string>();
  loading$: Observable<boolean> = this.store.select(
    RoutineState.routineLoading,
  );
  routines$: Observable<any[]> = this.store.select(RoutineState.routines);

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
      new GetRoutinesByPage({
        page: this.currentPage,
      }),
    );
    this.actions.pipe(ofActionSuccessful(GetRoutinesByPage)).subscribe(() => {
      this.totalRoutines$.subscribe((total) => {
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

  searchRoutines(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchValue = inputElement.value.trim();
    this.searchTerm$.next(this.searchValue);
  }
  performSearch(searchValue: string): void {
    this.isSearching = !!searchValue;
    this.store.dispatch(
      new GetRoutinesByName(
        {
          page: 1,
        },
        {
          name: searchValue,
        },
      ),
    );
  }

  editRoutine(e: string) {
    //TODO: Ver el error en consola al abrir el modal
    this.dialog.open(RoutineFormComponent, {
      width: '800px',
      data: { isEdit: true, routineId: e },
    });
  }

  deleteRoutine(e: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'Eliminar ejercicio',
        contentMessage: '¿Estás seguro de que deseas eliminar este ejercicio?',
      },
    });

    dialogRef.componentInstance.confirm.subscribe((value) => {
      if (!value) return;
      this.store.dispatch(new DeleteRoutine(e));
      this.actions
        .pipe(ofActionSuccessful(DeleteRoutine), takeUntil(this.destroy))
        .subscribe(() => {
          this.snackbar.showSuccess('Ejercicio borrado correctamente', 'OK');
          this.currentPage = 1;
          this.store
            .dispatch(new GetRoutinesByPage({ page: this.currentPage }))
            .subscribe(() => {
              this.totalRoutines$.subscribe((total) => {
                this.paginator.length = total;
                this.paginator.firstPage();
              });
            });
        });
    });
  }

  addRoutineModal() {
    this.dialog.open(RoutineFormComponent, {
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
        new GetRoutinesByName(
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
        new GetRoutinesByPage({
          page: this.currentPage,
        }),
      );
    }
  }
}
