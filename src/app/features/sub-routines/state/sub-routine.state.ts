import { Action, Selector, State, StateContext } from '@ngxs/store';
import { SubRoutineStateModel } from '@features/sub-routines/state/sub-routine.model';
import { Injectable } from '@angular/core';
import {
  SubRoutine,
  SubRoutineApiResponse,
} from '@features/sub-routines/interfaces/sub-routine.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { SubRoutineService } from '@features/sub-routines/services/sub-routine.service';
import {
  CreateSubRoutine,
  DeleteSubRoutine,
  GetSubRoutine,
  GetSubRoutines,
  SetSelectedSubRoutine,
  UpdateSelectedSubRoutine,
  UpdateSubRoutine,
} from '@features/sub-routines/state/sub-routine.actions';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Exercise } from '@features/exercises/interfaces/exercise.interface';

@State<SubRoutineStateModel>({
  name: 'subRoutines',
  defaults: {
    subRoutines: [],
    selectedSubRoutine: null,
    total: 0,
    loading: false,
    error: null,
    currentPage: 0,
    pageSize: 0,
    pageCount: 0,
  },
})
@Injectable({
  providedIn: 'root',
})
export class SubRoutinesState {
  @Selector()
  static getSubRoutines(state: SubRoutineStateModel): SubRoutine[] | null {
    return state?.subRoutines ?? [];
  }

  @Selector()
  static getTotal(state: SubRoutineStateModel): number | null {
    return state.total ?? 0;
  }

  @Selector()
  static getSubRoutineById(
    state: SubRoutineStateModel,
  ): (id: string) => SubRoutine | null {
    return (id: string): SubRoutine | null => {
      return (
        state.subRoutines?.find((subRoutine) => subRoutine._id === id) ?? null
      );
    };
  }

  @Selector()
  static isLoading(state: SubRoutineStateModel): boolean | null {
    return state.loading ?? false;
  }

  @Selector()
  static getError(state: SubRoutineStateModel): HttpErrorResponse | null {
    return state.error ?? null;
  }

  @Selector()
  static getSelectedSubRoutine(state: SubRoutineStateModel): SubRoutine | null {
    return state.selectedSubRoutine ?? null;
  }

  @Selector()
  static getSelectedSubRoutineExercises(
    state: SubRoutineStateModel,
  ): Exercise[] {
    return state.selectedSubRoutine?.exercises || [];
  }

  constructor(private subRoutineService: SubRoutineService) {}

  @Action(GetSubRoutines, { cancelUncompleted: true })
  getSubRoutines(
    ctx: StateContext<SubRoutineStateModel>,
    action: GetSubRoutines,
  ): Observable<SubRoutineApiResponse[]> {
    ctx.patchState({ loading: true, error: null });
    const { page, pageSize, searchQ } = action.payload;

    let getSubRoutinesObservable: Observable<SubRoutineApiResponse[]>;
    if (searchQ === null || searchQ === undefined) {
      getSubRoutinesObservable = this.subRoutineService.getSubRoutines(
        page,
        pageSize,
        '',
      );
    } else {
      getSubRoutinesObservable = this.subRoutineService.getSubRoutines(
        page,
        pageSize,
        searchQ,
      );
    }

    return getSubRoutinesObservable.pipe(
      tap((response: any) => {
        const subRoutines = response.data.data.map((subRoutine: any) => ({
          ...subRoutine,
        }));
        const total = response.data.total;
        const pageCount = Math.ceil(total / pageSize);

        ctx.patchState({
          subRoutines,
          total,
          loading: false,
          currentPage: page,
          pageSize,
          pageCount,
        });
      }),
      catchError((error) => {
        ctx.patchState({ error, loading: false });
        return throwError(() => error);
      }),
    );
  }

  @Action(GetSubRoutine, { cancelUncompleted: true })
  getSubRoutine(
    ctx: StateContext<SubRoutineStateModel>,
    { id }: GetSubRoutine,
  ): Observable<SubRoutine> {
    ctx.patchState({ loading: true, error: null });
    return this.subRoutineService.getSubRoutine(id).pipe(
      tap((res: any) => {
        const { data } = res;

        ctx.patchState({
          selectedSubRoutine: data,
          loading: false,
        });
      }),
      catchError((error) => {
        ctx.patchState({ error, loading: false });
        return throwError(() => error);
      }),
    );
  }

  @Action(CreateSubRoutine)
  createSubRoutine(
    ctx: StateContext<SubRoutineStateModel>,
    { subRoutine }: CreateSubRoutine,
  ): Observable<SubRoutine> {
    ctx.patchState({ loading: true, error: null });
    return this.subRoutineService.createSubRoutine(subRoutine).pipe(
      tap((createdSubRoutine: SubRoutine) => {
        const subRoutines = ctx
          .getState()
          .subRoutines?.concat(createdSubRoutine);
        ctx.patchState({ subRoutines, loading: false });
      }),
      catchError((error) => {
        ctx.patchState({ error, loading: false });
        return throwError(() => error);
      }),
    );
  }

  @Action(UpdateSubRoutine, { cancelUncompleted: true })
  updateSubRoutine(
    ctx: StateContext<SubRoutineStateModel>,
    { subRoutine }: UpdateSubRoutine,
  ): Observable<SubRoutine> {
    ctx.patchState({ loading: true, error: null });
    return this.subRoutineService.updateSubRoutine(subRoutine).pipe(
      tap((updatedSubRoutine: SubRoutine) => {
        const subRoutines = ctx
          .getState()
          .subRoutines?.map((u) =>
            u._id === updatedSubRoutine._id ? updatedSubRoutine : u,
          );
        ctx.patchState({ subRoutines, loading: false });
      }),
      catchError((error) => {
        ctx.patchState({ error, loading: false });
        return throwError(() => error);
      }),
    );
  }

  @Action(SetSelectedSubRoutine, { cancelUncompleted: true })
  setSelectedSubRoutine(
    ctx: StateContext<SubRoutineStateModel>,
    { subRoutine }: SetSelectedSubRoutine,
  ): void {
    ctx.patchState({ selectedSubRoutine: subRoutine });
  }

  @Action(DeleteSubRoutine, { cancelUncompleted: true })
  deleteSubRoutine(
    ctx: StateContext<SubRoutineStateModel>,
    { id }: DeleteSubRoutine,
  ): Observable<SubRoutine> {
    ctx.patchState({ loading: true, error: null });
    return this.subRoutineService.deleteSubRoutine(id).pipe(
      tap(() => {
        const subRoutines = ctx
          .getState()
          .subRoutines?.map((subRoutine) =>
            subRoutine._id === id
              ? { ...subRoutine }
              : subRoutine,
          );

        ctx.patchState({ subRoutines, loading: false });
      }),
      catchError((error) => {
        ctx.patchState({ error, loading: false });
        return throwError(() => error);
      }),
    );
  }

  @Action(UpdateSelectedSubRoutine, { cancelUncompleted: true })
  updateSelectedSubRoutine(
    ctx: StateContext<SubRoutineStateModel>,
    { subRoutine }: UpdateSelectedSubRoutine,
  ): void {
    ctx.patchState({ selectedSubRoutine: subRoutine });
  }
}
