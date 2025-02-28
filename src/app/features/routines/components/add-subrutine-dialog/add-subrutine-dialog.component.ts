import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { ClientsState } from '@features/client/state/clients.state';
import { RoutineState } from '@features/routines/state/routine.state';
import { SubRoutine } from '@features/sub-routines/interfaces/sub-routine.interface';
import { GetSubRoutines } from '@features/sub-routines/state/sub-routine.actions';
import { SubRoutinesState } from '@features/sub-routines/state/sub-routine.state';
import { Store } from '@ngxs/store';
import { FiltersBarComponent } from '@shared/components/filter-bar/filter-bar.component';
import { TableComponent } from '@shared/components/table/table.component';
import { TitleComponent } from '@shared/components/title/title.component';
import { BtnDirective } from '@shared/directives/btn/btn.directive';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ClearSubRoutines } from '@features/routines/state/routine.actions';

@Component({
  selector: 'app-add-subrutine-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    FiltersBarComponent,
    TableComponent,
    MatPaginator,
    AsyncPipe,
    BtnDirective,
    TitleComponent,
  ],
  templateUrl: './add-subrutine-dialog.component.html',
})
export class AddSubroutineDialogComponent implements OnInit {
  subRoutines$!: Observable<SubRoutine[]>;
  totalSubrutines$!: Observable<number>;
  loading$!: Observable<boolean>;
  selectedSubroutines: SubRoutine[] = [];
  subRoutines: SubRoutine[] = [];
  pageSize = environment.config.pageSize;
  pathClient: boolean = false;

  constructor(
    private store: Store,
    private dialogRef: MatDialogRef<AddSubroutineDialogComponent>,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.subRoutines$ = this.store.select(SubRoutinesState.getSubRoutines);
    this.totalSubrutines$ = this.store.select(SubRoutinesState.getTotal);
    this.loading$ = this.store.select(SubRoutinesState.isLoading);
    this.subRoutines = this.store.selectSnapshot(RoutineState.subRoutines);

    if (this.subRoutines.length === 0) {
      const routines = this.store.selectSnapshot(
        ClientsState.getSelectedRoutine,
      );
      this.subRoutines = routines.subRoutines;
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
    //this.store.dispatch(new ClearSubRoutines());
    this.dialogRef.close(null);
  }
}
