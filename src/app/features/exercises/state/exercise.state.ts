import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { Observable, catchError, tap, throwError, withLatestFrom } from 'rxjs';

import { ExerciseStateModel } from './exercise.model';
import { Exercise } from '../interfaces/exercise.interface';
import { ExerciseService } from '../services/exercise.service';
import {
  CreateExercise,
  DeleteExercise,
  GetExerciseById,
  GetExercisesByName,
  GetExercisesByPage,
  SetLimitPerPage,
  UpdateExercise,
} from './exercise.actions';
import { environment } from '../../../../environments/environment';
import { sortBySelection } from '@shared/helper/helpers';
import { SubRoutinesState } from '@features/sub-routines/state/sub-routine.state';

@State<ExerciseStateModel>({
  name: 'excercise',
  defaults: {
    exerciseEditing: null,
    exercises: [],
    totalExercises: 0,
    page: null,
    limit: environment.config.pageSize,
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

  @Selector()
  static page(state: ExerciseStateModel): number {
    return state.limit;
  }

  @Selector()
  static exerciseEditing(state: ExerciseStateModel): Exercise | null {
    return state.exerciseEditing || null;
  }

  constructor(
    private exerciseService: ExerciseService,
    private store: Store,
  ) {}

  @Action(GetExercisesByPage, { cancelUncompleted: true })
  getExercises(
    ctx: StateContext<ExerciseStateModel>,
    action: GetExercisesByPage,
  ): Observable<Exercise[]> {
    ctx.patchState({ loading: true });

    return this.exerciseService
      .getExercisesByPage(action.payload.page, ctx.getState().limit)
      .pipe(
        withLatestFrom(
          this.store.select(SubRoutinesState.getSelectedSubRoutineExercises),
        ),
        tap(([response, selectedExercises]) => {
          const exercises = response.data.data;
          const sortedExercises = sortBySelection(
            exercises,
            selectedExercises,
            (ex) => ex._id,
          );

          ctx.patchState({
            exercises: sortedExercises,
            loading: false,
            totalExercises: response.data.total,
          });
        }),
        catchError((error: HttpErrorResponse) => {
          ctx.patchState({ loading: false });
          return throwError(() => error);
        }),
      );
  }

  @Action(GetExercisesByName, { cancelUncompleted: true })
  getExercisesByName(
    ctx: StateContext<ExerciseStateModel>,
    action: GetExercisesByName,
  ): Observable<Exercise[]> {
    ctx.patchState({ loading: true });
    return this.exerciseService
      .getExercisesByName(
        action.pageInformation.page,
        ctx.getState().limit,
        action.filtersInformation,
      )
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
          return throwError(() => error);
        }),
      );
  }

  @Action(CreateExercise, { cancelUncompleted: true })
  createExercise(
    ctx: StateContext<ExerciseStateModel>,
    action: CreateExercise,
  ): Observable<Exercise> {
    ctx.patchState({ loading: true });
    return this.exerciseService.createExercise(action.payload).pipe(
      tap(() => {
        ctx.patchState({ loading: false });
      }),
      catchError((error: HttpErrorResponse) => {
        ctx.patchState({ loading: false });
        return throwError(error);
      }),
    );
  }

  @Action(DeleteExercise, { cancelUncompleted: true })
  deleteExercise(
    ctx: StateContext<ExerciseStateModel>,
    action: DeleteExercise,
  ): Observable<void> {
    ctx.patchState({ loading: true });
    return this.exerciseService.deleteExercise(action.id).pipe(
      tap(() => {
        ctx.patchState({ loading: false });
      }),
      catchError((error: HttpErrorResponse) => {
        ctx.patchState({ loading: false });
        return throwError(error);
      }),
    );
  }

  @Action(GetExerciseById, { cancelUncompleted: true })
  getExerciseById(
    ctx: StateContext<ExerciseStateModel>,
    action: GetExerciseById,
  ): Observable<Exercise> {
    ctx.patchState({ loading: true });
    return this.exerciseService.getExerciseById(action.id).pipe(
      tap((response) => {
        ctx.patchState({ loading: false, exerciseEditing: response.data });
      }),
      catchError((error: HttpErrorResponse) => {
        ctx.patchState({ loading: false });
        return throwError(error);
      }),
    );
  }

  @Action(UpdateExercise, { cancelUncompleted: true })
  updateExercise(
    ctx: StateContext<ExerciseStateModel>,
    action: UpdateExercise,
  ): Observable<Exercise> {
    ctx.patchState({ loading: true });
    return this.exerciseService.updateExercise(action.payload, action.id).pipe(
      tap(() => {
        ctx.patchState({ loading: false });
      }),
      catchError((error: HttpErrorResponse) => {
        ctx.patchState({ loading: false });
        return throwError(error);
      }),
    );
  }
  @Action(SetLimitPerPage, { cancelUncompleted: true })
  setLimitPerPage(
    ctx: StateContext<ExerciseStateModel>,
    action: SetLimitPerPage,
  ): void {
    ctx.patchState({ limit: action.limit });
  }
}
