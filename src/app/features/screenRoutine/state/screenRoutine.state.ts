import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ExerciseService } from '@features/exercises/services/exercise.service';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import {
  catchError,
  forkJoin,
  map,
  Observable,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { ScreenRoutineService } from '../services/screenRoutine.service';
import { GetScreenRoutinesByPage } from './screenRoutine.actions';
import { ScreenRoutineStateModel } from './screenRoutine.model';
import { RoutineService } from '@features/routines/services/routine.service';

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
    private exerciseService: ExerciseService,
    private routineService: RoutineService,
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
        switchMap((response) => {
          const routines = response.data.data; // Lista de rutinas

          // 1️⃣ Obtener las subrutinas de cada rutina
          const routineRequests = routines.map((routine: any) =>
            this.routineService.getRoutineById(routine._id).pipe(
              map((routineResponse) => ({
                ...routine,
                subRoutines: routineResponse.data.subRoutines, // Agregamos las subrutinas completas
              })),
            ),
          );

          return forkJoin(routineRequests).pipe(
            switchMap((routinesWithSubroutines: any) => {
              // 2️⃣ Obtener los ejercicios de cada subrutina
              const subroutines = routinesWithSubroutines.flatMap(
                (routine: any) => routine.subRoutines,
              );

              const exerciseRequests = subroutines.flatMap((subroutine: any) =>
                subroutine.exercises.map((exerciseId: string) =>
                  this.exerciseService.getExerciseById(exerciseId).pipe(
                    map((exerciseResponse) => ({
                      subroutineId: subroutine._id,
                      exercise: exerciseResponse.data,
                    })),
                  ),
                ),
              );

              return forkJoin(exerciseRequests).pipe(
                map((subroutineExercises: any) => {
                  // 3️⃣ Agrupar ejercicios por subrutina
                  const exercisesBySubroutine = subroutineExercises.reduce(
                    (
                      acc: any,
                      {
                        subroutineId,
                        exercise,
                      }: { subroutineId: string; exercise: any },
                    ) => {
                      if (!acc[subroutineId]) {
                        acc[subroutineId] = [];
                      }
                      acc[subroutineId].push(exercise);
                      return acc;
                    },
                    {} as Record<string, any[]>,
                  );

                  // 4️⃣ Estructurar la respuesta final con ejercicios dentro de cada subrutina
                  const updatedRoutines = routinesWithSubroutines.map(
                    (routine: any) => ({
                      ...routine,
                      subRoutines: routine.subRoutines.map(
                        (subroutine: any) => ({
                          ...subroutine,
                          exercises:
                            exercisesBySubroutine[subroutine._id] || [],
                        }),
                      ),
                    }),
                  );

                  return {
                    ...response,
                    data: {
                      ...response.data,
                      routines: updatedRoutines,
                    },
                  };
                }),
              );
            }),
          );
        }),
        tap((updatedResponse: any) => {
          console.log(updatedResponse.data);
          ctx.patchState({
            screenRoutines: updatedResponse.data.routines,
            loading: false,
          });
        }),
        catchError((error: HttpErrorResponse) => {
          ctx.patchState({ loading: false });
          return throwError(() => error); // 💡 Angular usa esta sintaxis con RxJS >= 7
        }),
      );
  }
}
