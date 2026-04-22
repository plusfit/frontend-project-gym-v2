import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import {
  Observable,
  catchError,
  map,
  tap,
  throwError,
} from 'rxjs';
import { ScreenRoutineService } from '../services/screenRoutine.service';
import { GetScreenRoutinesByPage } from './screenRoutine.actions';
import { ScreenRoutineStateModel } from './screenRoutine.model';


@State<ScreenRoutineStateModel>({
  name: 'screenRoutine',
  defaults: {
    screenRoutines: [],
    loading: false,
  },
})
@Injectable({ providedIn: 'root' })
export class ScreenRoutineState {
  constructor(
    private screenRoutineService: ScreenRoutineService,
  ) {}

  @Selector()
  static screenRoutines(state: ScreenRoutineStateModel): any[] | undefined {
    return state.screenRoutines;
  }



  @Action(GetScreenRoutinesByPage, { cancelUncompleted: true })
  getRoutines(
    ctx: StateContext<ScreenRoutineStateModel>,
    action: GetScreenRoutinesByPage,
  ): Observable<any[]> {
    const { limit, page, isGeneral } = action.payload;
    ctx.patchState({ loading: true });

    return this.screenRoutineService
      .getScreenRoutines(limit, page, isGeneral)
      .pipe(
        map((response) => {
          const routines = response.data.data;
          return {
            ...response,
            data: {
              ...response.data,
              routines: routines,
            },
          };
        }),
        tap((updatedResponse: any) => {
          ctx.patchState({
            screenRoutines: updatedResponse.data.routines,
            loading: false,
          });
        }),
        catchError((error: HttpErrorResponse) => {
          ctx.patchState({ loading: false });
          return throwError(() => error);
        }),
      );
  }
}
