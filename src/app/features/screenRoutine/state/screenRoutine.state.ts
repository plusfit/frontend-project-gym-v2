import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { ScreenRoutineStateModel } from './screenRoutine.model';
import { GetScreenRoutinesByPage } from './screenRoutine.actions';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ScreenRoutineService } from '../services/screenRoutine.service';

@State<ScreenRoutineStateModel>({
  name: 'screenRoutine',
  defaults: {
    screenRoutines: [],
    loading: false,
  },
})
@Injectable({ providedIn: 'root' })
export class ScreenRoutineState {
  constructor(private screenRoutineService: ScreenRoutineService) {}

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
        tap((response) => {
          const routines = response.data.data;
          ctx.patchState({
            screenRoutines: routines,
            loading: false,
          });
        }),
        catchError((error: HttpErrorResponse) => {
          ctx.patchState({ loading: false });
          return throwError(error);
        }),
      );
  }
}
