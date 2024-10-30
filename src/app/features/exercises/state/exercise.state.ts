import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Observable, catchError, tap, throwError } from 'rxjs';

import { ExerciseStateModel } from './exercise.model';
import { Exercise } from '../interfaces/exercise.interface';
import { ExerciseService } from '../services/exercise.service';
import { GetExercisesByPage } from './exercise.actions';

@State<ExerciseStateModel>({
  name: 'excercise',
  defaults: {
    exercises: [],
    totalExercises: 0,
    page: null,
    filters: null,
    loading: false,
  },
})
@Injectable({ providedIn: 'root' })
export class ExerciseState {
  @Selector()
  static exerciseLoading(state: ExerciseStateModel): boolean {
    return state.loading || false;
  }

  @Selector()
  static exercises(state: ExerciseStateModel): Exercise[] {
    return state.exercises || [];
  }

  @Selector()
  static totalExercises(state: ExerciseStateModel): number {
    return state.totalExercises || 0;
  }

  constructor(private exerciseService: ExerciseService) {}

  @Action(GetExercisesByPage, { cancelUncompleted: true })
  login(
    ctx: StateContext<ExerciseStateModel>,
    action: GetExercisesByPage,
  ): Observable<Exercise[]> {
    ctx.patchState({ loading: true });
    console.log('GetExercisesByPage', action.payload);
    return this.exerciseService
      .getExercisesByPage(action.payload.page, action.payload.limit)
      .pipe(
        tap((response) => {
          const exercises = response.data.data;
          ctx.patchState({
            exercises,
            loading: false,
            totalExercises: response.data.total,
          });
        }),
        catchError((error: HttpErrorResponse) => {
          ctx.patchState({ loading: false });
          return throwError(error);
        }),
      );
  }
}
