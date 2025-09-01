import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { ScheduleStateModel } from './schedule.model';
import { ScheduleService } from '../services/schedule.service';
import { catchError, forkJoin, Observable, switchMap, tap, throwError } from 'rxjs';
import {
  AssignClient,
  ClearClients,
  DeleteClient,
  DeleteHour,
  EditHour,
  postClientsArray,
  getClientsAssignable,
  GetClientsById,
  getMaxCount,
  GetSchedule,
  SelectedClient,
  ClearSelectedClient,
  GetDisabledDays,
  SetDisabledDays,
  ToggleDayStatus,
  ToggleScheduleDisabled,
  ToggleAllDaySchedules,
} from './schedule.actions';
import { EDay } from '@core/enums/day.enum';

@State<ScheduleStateModel>({
  name: 'schedule',
  defaults: {
    schedule: null,
    clients: [],
    maxCount: 0,
    clientsAssignable: [],
    selectedClient: null,
    loadingAssignable: false,
    loadingHour: false,
    loading: false,
    disabledDays: [],
  },
})
@Injectable({ providedIn: 'root' })
export class ScheduleState {
  constructor(private scheduleService: ScheduleService) {}

  @Selector()
  static scheduleLoading(state: ScheduleStateModel): boolean {
    return state?.loading || false;
  }

  @Selector()
  static loadingAssignable(state: ScheduleStateModel): boolean {
    return state?.loadingAssignable || false;
  }

  @Selector()
  static loadingHour(state: ScheduleStateModel): boolean {
    return state?.loadingHour || false;
  }

  @Selector()
  static schedule(state: ScheduleStateModel): any {
    return state?.schedule;
  }

  @Selector()
  static clients(state: ScheduleStateModel): any {
    return state?.clients;
  }

  @Selector()
  static getTotalClients(state: ScheduleStateModel): number {
    return state.clients.length ?? 0;
  }

  @Selector()
  static getTotal(state: ScheduleStateModel): number {
    return state.total ?? 0;
  }

  @Selector()
  static clientsAssignable(state: ScheduleStateModel): any {
    return state?.clientsAssignable || [];
  }

  @Selector()
  static maxCount(state: ScheduleStateModel): number | undefined {
    return state?.maxCount;
  }

  @Selector()
  static selectedClient(state: ScheduleStateModel): any {
    return state?.selectedClient;
  }

  @Selector()
  static disabledDays(state: ScheduleStateModel): string[] {
    return state?.disabledDays || [];
  }

  @Selector()
  static enabledSchedule(state: ScheduleStateModel): any {
    const schedule = state?.schedule;
    const disabledDays = state?.disabledDays || [];
    
    if (!schedule) return null;
    
    return schedule.filter((day: any) => !disabledDays.includes(day.day));
  }

  obtenerElementosRepetidos(array: string[]): string[] {
    const conteo: Record<string, number> = {};
    const repetidos: string[] = [];

    // Contar las ocurrencias de cada elemento
    for (const elemento of array) {
      conteo[elemento] = (conteo[elemento] || 0) + 1;
    }

    // Filtrar los elementos que tienen más de una ocurrencia
    for (const [elemento, cantidad] of Object.entries(conteo)) {
      if (cantidad > 1) {
        repetidos.push(elemento);
      }
    }

    return repetidos;
  }

  @Action(GetSchedule)
  getSchedule(ctx: StateContext<ScheduleStateModel>) {
    ctx.patchState({ loading: true });
    return this.scheduleService.getSchedule().pipe(
      switchMap((schedule: any) => {
        // Primero cargamos el schedule
        // Agrupamos los horarios por día y ordenamos los resultados
        const sortSchedule = schedule.data.reduce((acc: any[], hour: any) => {
          // Buscamos si ya existe una entrada para el día actual
          let dayEntry = acc.find((d: any) => d.day === hour.day);
       

          if (!dayEntry) {
            // Si no existe, la creamos
            dayEntry = { day: hour.day, hours: [] };
            acc.push(dayEntry);
          }

          // Añadimos el horario actual al día correspondiente
          dayEntry.hours.push({
            _id: hour._id,
            startTime: hour.startTime,
            endTime: hour.endTime,
            clients: hour.clients,
            maxCount: hour.maxCount,
          });

          // Ordenamos las horas dentro del día por la hora de inicio
          dayEntry.hours.sort(
            (a: any, b: any) =>
              parseInt(a.startTime, 10) - parseInt(b.startTime, 10),
          );

          return acc;
        }, []);

        const daysOrder = [
          'Lunes',
          'Martes',
          'Miércoles',
          'Jueves',
          'Viernes',
          'Sábado',
          'Domingo',
        ];

        // Ordenar los días según el orden definido
        sortSchedule.sort((a: any, b: any) => {
          const dayA = daysOrder.indexOf(a.day);
          const dayB = daysOrder.indexOf(b.day);
          return dayA - dayB;
        });

        ctx.patchState({ schedule: sortSchedule });

        // Ahora cargamos los días deshabilitados
        return this.scheduleService.getDisabledDays().pipe(
          tap((response: any) => {
            const disabledDays = response?.data?.disabledDays || [];
            ctx.patchState({ disabledDays, loading: false });
          }),
          catchError((error) => {
            // Si falla la carga de días deshabilitados, solo continuamos con schedule cargado
            console.warn('Error loading disabled days:', error);
            ctx.patchState({ loading: false });
            return throwError(() => error);
          })
        );
      }),
      catchError((error) => {
        ctx.patchState({ loading: false });
        return throwError(() => error);
      })
    );
  }

  @Action(GetClientsById)
  getClientsById(
    ctx: StateContext<ScheduleStateModel>,
    action: GetClientsById,
  ) {
    return this.scheduleService.getClientsByid(action._id).pipe(
      tap((client: any) => {
        const state = ctx.getState();
        const currentClients = Array.isArray(state.clients)
          ? state.clients
          : [];

        // Evitar duplicados basados en `_id` antes de agregar el cliente
        const updatedClients = currentClients.some(
          (existingClient: any) => existingClient._id === client._id,
        )
          ? currentClients // Si el cliente ya está en la lista, no lo agregamos
          : [...currentClients, client]; // De lo contrario, agregamos el cliente

        ctx.patchState({ clients: updatedClients });
      }),
    );
  }

  @Action(postClientsArray)
  getClientsArray(
    ctx: StateContext<ScheduleStateModel>,
    action: postClientsArray,
  ) {
    return this.scheduleService.postClientsArray(action.ids).pipe(
      tap((clients: any) => {
        const state = ctx.getState();
        const currentClients = Array.isArray(state.clients)
          ? state.clients
          : [];

        // Evitar duplicados basados en `_id` antes de agregar el cliente
        const updatedClients = clients.data.filter((client: any) => {
          return !currentClients.some(
            (existingClient: any) => existingClient._id === client._id,
          );
        });

        ctx.patchState({ clients: [...currentClients, ...updatedClients] });
        ctx.patchState({ maxCount: state.schedule?.maxCount });
      }),
    );
  }

  @Action(EditHour)
  editHour(ctx: StateContext<ScheduleStateModel>, action: EditHour) {
    ctx.patchState({ loadingHour: true });
    return this.scheduleService
      .updateSchedule(action._id, action.schedule)
      .pipe(
        tap(() => {
          const state = ctx.getState();
          const schedule = state.schedule?.map((day: any) => {
            return {
              ...day,
              hours: day.hours.map((hour: any) => {
                if (hour._id === action._id) {
                  return {
                    ...hour,
                    ...action.schedule,
                  };
                }
                return hour;
              }),
            };
          });
          ctx.patchState({ schedule });
          ctx.patchState({ loadingHour: false });
        }),
      );
  }
  @Action(DeleteHour)
  deleteHour(ctx: StateContext<ScheduleStateModel>, action: DeleteHour) {
    return this.scheduleService.deleteHour(action._id).pipe(
      tap(() => {
        const state = ctx.getState();
        const schedule = state.schedule?.map((day: any) => {
          return {
            ...day,
            hours: day.hours.filter((hour: any) => hour._id !== action._id),
          };
        });
        ctx.patchState({ schedule });
      }),
    );
  }

  @Action(AssignClient)
  assignClient(ctx: StateContext<ScheduleStateModel>, action: AssignClient) {
    ctx.patchState({ loadingAssignable: true });
    return this.scheduleService
      .assignClientToHour(action._id, action.clients)
      .pipe(
        switchMap(() =>
          this.scheduleService.postClientsArray(action.clients).pipe(
            // Recuperar detalles del cliente
            tap((clientDetails) => {
              const state = ctx.getState();

              // Actualiza el cliente en el horario correspondiente
              const schedule = state.schedule?.map((day: any) => {
                return {
                  ...day,
                  hours: day.hours.map((hour: any) => {
                    if (hour._id === action._id) {
                      if (hour.clients.length >= hour.maxCount) {
                        return hour;
                      }
                      const newClients = [...hour.clients];
                      clientDetails.data.forEach((client: any) => {
                        newClients.push(client._id);
                      });

                      return {
                        ...hour,
                        clients: newClients,
                      };
                    }
                    return hour;
                  }),
                };
              });

              // Actualiza la lista de clientes en el estado
              const updatedClients = [...state.clients, ...clientDetails.data];

              ctx.patchState({
                clients: updatedClients,
                schedule,
                loadingAssignable: false,
              });
            }),
          ),
        ),
      );
  }

  @Action(getClientsAssignable)
  getClientsAssignable(
    ctx: StateContext<ScheduleStateModel>,
    action: getClientsAssignable,
  ): Observable<any> {
    ctx.patchState({ loadingAssignable: true });
    const { page, pageSize, searchQ, hourId } = action.payload;
    let getAssignableClientsObservable: Observable<any>;

    if (searchQ === null || searchQ === undefined) {
      getAssignableClientsObservable =
        this.scheduleService.getClientsAssignable(
          page,
          pageSize,
          '',
          '',
          '',
          hourId || '',
        );
    } else {
      getAssignableClientsObservable =
        this.scheduleService.getClientsAssignable(
          page,
          pageSize,
          searchQ,
          searchQ,
          searchQ,
          hourId || '',
        );
    }

    return getAssignableClientsObservable.pipe(
      tap((response: any) => {
        const { data, total } = response.data;
        const clientsAssignable = data.map((client: any) => ({
          ...client,
        }));

        const pageCount = Math.ceil(total / pageSize);

        ctx.patchState({
          clientsAssignable,
          total,
          loadingAssignable: false,
          currentPage: page,
          pageSize,
          pageCount,
        });
      }),
      catchError((error) => {
        ctx.patchState({ error, loadingAssignable: false });
        return throwError(() => error);
      }),
    );
  }

  @Action(DeleteClient)
  deleteClient(ctx: StateContext<ScheduleStateModel>, action: any) {
    return this.scheduleService
      .deleteClientFromHour(action._id, action.client)
      .pipe(
        tap(() => {
          const state = ctx.getState();
          const updatedClients = state.clients.filter(
            (client: any) => client._id !== action.client,
          );
          ctx.patchState({ clients: updatedClients });
          const schedule = state.schedule?.map((day: any) => {
            return {
              ...day,
              hours: day.hours.map((hour: any) => {
                if (hour._id === action._id) {
                  return {
                    ...hour,
                    clients: [...updatedClients.map((c: any) => c._id)],
                  };
                }
                return hour;
              }),
            };
          });
          ctx.patchState({ schedule });
        }),
      );
  }

  @Action(ClearClients)
  clearClients(ctx: StateContext<ScheduleStateModel>) {
    const state = ctx.getState();
    ctx.patchState({
      ...state,
      clients: [], // Limpia la lista de clientes
    });
  }

  @Action(getMaxCount)
  getMaxCount(ctx: StateContext<ScheduleStateModel>, action: getMaxCount) {
    const state = ctx.getState();

    // Buscar el día correspondiente
    const dayToEdit = state.schedule?.find((day: any) =>
      day.hours.some((hour: any) => hour._id === action._id),
    );

    if (!dayToEdit) {
      return;
    }

    // Encontrar el horario específico dentro del día
    const hourToEdit = dayToEdit.hours.find(
      (hour: any) => hour._id === action._id,
    );

    if (!hourToEdit) {
      return;
    }

    // Actualizar el maxCount en el estado
    const maxCount = hourToEdit.maxCount;
    ctx.patchState({ maxCount });
  }

  @Action(SelectedClient, { cancelUncompleted: true })
  selectedClient(
    ctx: StateContext<ScheduleStateModel>,
    action: SelectedClient,
  ) {
    ctx.patchState({ selectedClient: action.client });
  }

  @Action(ClearSelectedClient)
  clearSelectedClient(ctx: StateContext<ScheduleStateModel>) {
    ctx.patchState({ selectedClient: null });
  }

  @Action(GetDisabledDays)
  getDisabledDays(ctx: StateContext<ScheduleStateModel>) {
    return this.scheduleService.getDisabledDays().pipe(
      tap((response: any) => {
        const disabledDays = response?.data?.disabledDays || [];
        ctx.patchState({ disabledDays });
      }),
      catchError((error) => {
        console.error('Error loading disabled days:', error);
        return throwError(() => error);
      })
    );
  }

  @Action(SetDisabledDays)
  setDisabledDays(ctx: StateContext<ScheduleStateModel>, action: SetDisabledDays) {
    return this.scheduleService.updateDisabledDays(action.disabledDays).pipe(
      tap(() => {
        ctx.patchState({ disabledDays: action.disabledDays });
      }),
      catchError((error) => {
        console.error('Error updating disabled days:', error);
        return throwError(() => error);
      })
    );
  }

  @Action(ToggleDayStatus)
  toggleDayStatus(ctx: StateContext<ScheduleStateModel>, action: ToggleDayStatus) {
    const state = ctx.getState();
    const disabledDays = state.disabledDays || [];
    
    let updatedDisabledDays: string[];
    
    if (disabledDays.includes(action.day)) {
      // Si el día está deshabilitado, lo habilitamos
      updatedDisabledDays = disabledDays.filter(day => day !== action.day);
    } else {
      // Si el día está habilitado, lo deshabilitamos
      updatedDisabledDays = [...disabledDays, action.day];
    }

    return this.scheduleService.updateDisabledDays(updatedDisabledDays).pipe(
      tap(() => {
        ctx.patchState({ disabledDays: updatedDisabledDays });
      }),
      catchError((error) => {
        console.error('Error toggling day status:', error);
        return throwError(() => error);
      })
    );
  }

  @Action(ToggleScheduleDisabled)
  toggleScheduleDisabled(ctx: StateContext<ScheduleStateModel>, action: ToggleScheduleDisabled) {
    return this.scheduleService.toggleScheduleDisabled(action.scheduleId, action.disabled).pipe(
      tap(() => {
        const state = ctx.getState();
        const schedule = state.schedule?.map((day: any) => {
          return {
            ...day,
            hours: day.hours.map((hour: any) => {
              if (hour._id === action.scheduleId) {
                return {
                  ...hour,
                  disabled: action.disabled,
                };
              }
              return hour;
            }),
          };
        });
        ctx.patchState({ schedule });
      }),
      catchError((error) => {
        console.error('Error toggling schedule disabled:', error);
        return throwError(() => error);
      })
    );
  }

  @Action(ToggleAllDaySchedules)
  toggleAllDaySchedules(ctx: StateContext<ScheduleStateModel>, action: ToggleAllDaySchedules) {
    const state = ctx.getState();
    const schedule = state.schedule;
    
    if (!schedule) return;

    // Encontrar todos los horarios del día específico
    const daySchedule = schedule.find((day: any) => day.day === action.day);
    
    if (!daySchedule || !daySchedule.hours || daySchedule.hours.length === 0) {
      // Si no hay horarios, solo actualizar el estado local
      return this.toggleDayStatus(ctx, new ToggleDayStatus(action.day));
    }

    // Crear observables para toggle de todos los horarios del día
    const toggleRequests = daySchedule.hours.map((hour: any) => 
      this.scheduleService.toggleScheduleDisabled(hour._id, action.disabled)
    );

    // Ejecutar todas las peticiones en paralelo
    return forkJoin(toggleRequests).pipe(
      tap(() => {
        // Actualizar el estado local después de que todas las peticiones sean exitosas
        const updatedSchedule = schedule.map((day: any) => {
          if (day.day === action.day) {
            return {
              ...day,
              hours: day.hours.map((hour: any) => ({
                ...hour,
                disabled: action.disabled
              }))
            };
          }
          return day;
        });

        // También actualizar los días deshabilitados
        const disabledDays = state.disabledDays || [];
        let updatedDisabledDays: string[];
        
        if (action.disabled) {
          // Agregar el día a la lista de deshabilitados si no está
          updatedDisabledDays = disabledDays.includes(action.day) 
            ? disabledDays 
            : [...disabledDays, action.day];
        } else {
          // Remover el día de la lista de deshabilitados
          updatedDisabledDays = disabledDays.filter(day => day !== action.day);
        }

        ctx.patchState({ 
          schedule: updatedSchedule,
          disabledDays: updatedDisabledDays 
        });

        // Guardar también en localStorage para persistencia
        localStorage.setItem('disabledDays', JSON.stringify(updatedDisabledDays));
      }),
      catchError((error) => {
        console.error('Error toggling all day schedules:', error);
        return throwError(() => error);
      })
    );
  }
}
