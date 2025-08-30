import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import {
  catchError,
  Observable,
  tap,
  throwError,
} from 'rxjs';
import { Routine, RoutinesApiResponse } from '@features/routines/interfaces/routine.interface';
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
  constructor(private screenRoutineService: ScreenRoutineService) {}

  @Selector()
  static screenRoutines(state: ScreenRoutineStateModel): Routine[] {
    return state.screenRoutines || [];
  }

  @Action(GetScreenRoutinesByPage, { cancelUncompleted: true })
  getRoutines(
    ctx: StateContext<ScreenRoutineStateModel>,
    action: GetScreenRoutinesByPage,
  ): Observable<RoutinesApiResponse> {
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
          return throwError(() => error);
        }),
      );
  }
}
