import { Component, OnInit } from '@angular/core';
import { GetScreenRoutinesByPage } from '@features/screenRoutine/state/screenRoutine.actions';
import { Actions, Store, ofActionSuccessful } from '@ngxs/store';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { ScreenComponent } from '../../components/screen/screen.component';

@Component({
  selector: 'app-screen-pages',
  standalone: true,
  imports: [ScreenComponent, LoaderComponent],
  templateUrl: './screen-pages.component.html',
  styleUrl: './screen-pages.component.css',
})
export class ScreenPagesComponent implements OnInit {
  routines: any[] = [];
  constructor(
    private store: Store,
    private actions: Actions,
  ) {}

  ngOnInit() {
    this.store.dispatch(
      new GetScreenRoutinesByPage({ page: 1, limit: 3, isGeneral: true }),
    );
    this.actions
      .pipe(ofActionSuccessful(GetScreenRoutinesByPage))
      .subscribe(() => {
        this.store
          .select((state) => state.screenRoutine)
          .subscribe((routines) => {
            this.routines = routines.screenRoutines;
          });
      });
  }
}
