import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, Observable, tap, throwError } from 'rxjs';

import { SubRoutine } from '@features/sub-routines/interfaces/sub-routine.interface';
import { environment } from '../../../../environments/environment.prod';
import {
  Routine,
  RoutineApiResponse,
  RoutinesApiResponse,
  RoutinesBySubRoutineApiResponse,
} from '../interfaces/routine.interface';
import { RoutineService } from '../services/routine.service';
import {
  ClearSubRoutines,
  CreateRoutine,
  DeleteRoutine,
  GetRoutineById,
  GetRoutinesByName,
  GetRoutinesByPage,
  GetRoutinesBySubRoutine,
  SetLimitPerPage,
  UpdateRoutine,
  UpdateSubRoutines,
} from './routine.actions';
import { RoutineStateModel } from './routine.model';

@State<RoutineStateModel>({
  name: 'routine',
  defaults: {
    routines: [],
    affectedRoutines: [],
    totalRoutines: 0,
    page: null,
    limit: environment.routineTableLimit,
    filters: null,
    loading: false,
    selectedRoutine: null,
    subRoutines: [],
  },
})
@Injectable({ providedIn: 'root' })
export class RoutineState {
  @Selector()
  static subRoutines(state: RoutineStateModel): SubRoutine[] {
    return state.selectedRoutine?.subRoutines || [];
  }

  @Selector()
  static selectedRoutine(state: RoutineStateModel): Routine | null {
    return state.selectedRoutine || null;
  }

  @Selector()
  static routineLoading(state: RoutineStateModel): boolean {
    return state.loading || false;
  }

  @Selector()
  static routines(state: RoutineStateModel): Routine[] {
    return state.routines || [];
  }

  @Selector()
  static affectedRoutines(state: RoutineStateModel): Routine[] {
    return state.affectedRoutines || [];
  }

  @Selector()
  static totalRoutines(state: RoutineStateModel): number {
    return state.totalRoutines || 0;
  }

  @Selector()
  static page(state: RoutineStateModel): number {
    return state.limit;
  }

  constructor(private routineService: RoutineService) {}

  @Action(GetRoutinesByPage, { cancelUncompleted: true })
  getRoutines(
    ctx: StateContext<RoutineStateModel>,
    action: GetRoutinesByPage,
  ): Observable<RoutinesApiResponse> {
    ctx.patchState({ loading: true });
    return this.routineService
      .getRoutinesByPage(action.payload.page, ctx.getState().limit)
      .pipe(
        tap((response) => {
          const routines = response.data.data;
          ctx.patchState({
            routines,
            loading: false,
            totalRoutines: response.data.total,
          });
        }),
        catchError((error: HttpErrorResponse) => {
          ctx.patchState({ loading: false });
          return throwError(error);
        }),
      );
  }

  @Action(GetRoutinesByName, { cancelUncompleted: true })
  getRoutinesByName(
    ctx: StateContext<RoutineStateModel>,
    action: GetRoutinesByName,
  ): Observable<RoutinesApiResponse> {
    ctx.patchState({ loading: true });
    return this.routineService
      .getRoutinesByName(
        action.pageInformation.page,
        ctx.getState().limit,
        action.filtersInformation,
      )
      .pipe(
        tap((response) => {
          const routines = response.data.data;
          ctx.patchState({
            routines,
            loading: false,
            totalRoutines: response.data.total,
          });
        }),
        catchError((error: HttpErrorResponse) => {
          ctx.patchState({ loading: false });
          return throwError(error);
        }),
      );
  }

  @Action(CreateRoutine, { cancelUncompleted: true })
  createRoutine(
    ctx: StateContext<RoutineStateModel>,
    action: CreateRoutine,
  ): Observable<Routine> {
    ctx.patchState({ loading: true });
    return this.routineService.createRoutine(action.payload).pipe(
      tap(() => {
        ctx.patchState({ loading: false, selectedRoutine: null });
      }),
      catchError((error: HttpErrorResponse) => {
        ctx.patchState({ loading: false });
        return throwError(error);
      }),
    );
  }

  @Action(DeleteRoutine, { cancelUncompleted: true })
  deleteRoutine(
    ctx: StateContext<RoutineStateModel>,
    action: DeleteRoutine,
  ): Observable<RoutineApiResponse> {
    ctx.patchState({ loading: true });
    return this.routineService.deleteRoutine(action.id).pipe(
      tap(() => {
        ctx.patchState({ loading: false });
      }),
      catchError((error: HttpErrorResponse) => {
        ctx.patchState({ loading: false });
        return throwError(error);
      }),
    );
  }

  @Action(GetRoutineById, { cancelUncompleted: true })
  getRoutineById(
    ctx: StateContext<RoutineStateModel>,
    action: GetRoutineById,
  ): Observable<RoutineApiResponse> {
    ctx.patchState({ loading: true });
    return this.routineService.getRoutineById(action.id).pipe(
      tap((response) => {
        ctx.patchState({ loading: false, selectedRoutine: response.data });
      }),
      catchError((error: HttpErrorResponse) => {
        ctx.patchState({ loading: false });
        return throwError(error);
      }),
    );
  }

  @Action(UpdateRoutine, { cancelUncompleted: true })
  updateRoutine(
    ctx: StateContext<RoutineStateModel>,
    action: UpdateRoutine,
  ): Observable<Routine> {
    ctx.patchState({ loading: true });
    return this.routineService
      .updateRoutine(action.payload, action.id, action.idClient ?? '')
      .pipe(
        tap(() => {
          ctx.patchState({ loading: false, selectedRoutine: null });
        }),
        catchError((error: HttpErrorResponse) => {
          ctx.patchState({ loading: false });
          return throwError(error);
        }),
      );
  }

  @Action(SetLimitPerPage, { cancelUncompleted: true })
  setLimitPerPage(
    ctx: StateContext<RoutineStateModel>,
    action: SetLimitPerPage,
  ): void {
    ctx.patchState({ limit: action.limit });
  }

  @Action(UpdateSubRoutines)
  updateSubroutines(
    ctx: StateContext<RoutineStateModel>,
    action: UpdateSubRoutines,
  ) {
    ctx.patchState({
      selectedRoutine: action.newRoutine,
    });
  }

  @Action(ClearSubRoutines)
  clearSubRoutines(ctx: StateContext<RoutineStateModel>) {
    ctx.patchState({ selectedRoutine: null });
  }

  @Action(GetRoutinesBySubRoutine, { cancelUncompleted: true })
  getRoutinesBySubRoutine(
    ctx: StateContext<RoutineStateModel>,
    action: GetRoutinesBySubRoutine,
  ): Observable<RoutinesBySubRoutineApiResponse> {
    ctx.patchState({ loading: true });
    return this.routineService.getRoutinesBySubRoutine(action.id).pipe(
      tap((response) => {
        ctx.patchState({
          affectedRoutines: response.data,
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
