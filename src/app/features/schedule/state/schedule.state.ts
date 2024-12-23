import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, Observable, switchMap, tap, throwError } from 'rxjs';
import { ScheduleService } from '../services/schedule.service';
import {
  AssignClient,
  ClearClients,
  DeleteClient,
  DeleteHour,
  EditHour,
  getClientsAssignable,
  GetClientsById,
  getMaxCount,
  GetSchedule,
  postClientsArray,
} from './schedule.actions';
import { ScheduleStateModel } from './schedule.model';
import { environment } from '../../../../environments/environment.prod';

@State<ScheduleStateModel>({
  name: 'schedule',
  defaults: {
    schedule: null,
    clients: [],
    maxCount: 0,
    clientsAssignable: [],
    loading: false,
    limit: environment.routineTableLimit,
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
  static schedule(state: ScheduleStateModel): any {
    return state?.schedule;
  }

  @Selector()
  static clients(state: ScheduleStateModel): any {
    return state?.clients;
  }

  @Selector()
  static clientsAssignable(state: ScheduleStateModel): any {
    return state?.clientsAssignable || [];
  }

  @Selector()
  static maxCount(state: ScheduleStateModel): number | undefined {
    return state?.maxCount;
  }

  @Action(GetSchedule)
  getSchedule(ctx: StateContext<ScheduleStateModel>) {
    ctx.patchState({ loading: true });
    return this.scheduleService.getSchedule().pipe(
      tap((schedule: any) => {
        const sortSchedule = schedule.data.reduce((acc: any, hour: any) => {
          let dayEntry = acc.find((d: any) => d.day === hour.day);
          if (!dayEntry) {
            dayEntry = { day: hour.day, hours: [] };
            acc.push(dayEntry);
          }
          dayEntry.hours.push({
            _id: hour._id,
            startTime: hour.startTime,
            endTime: hour.endTime,
            clients: hour.clients,
            maxCount: hour.maxCount,
          });
          dayEntry.hours.sort((a: any, b: any) => {
            return parseInt(a.startTime, 10) - parseInt(b.startTime, 10);
          });
          acc = acc.sort((a: any, b: any) => {
            const days = [
              'Lunes',
              'Martes',
              'Miercoles',
              'Jueves',
              'Viernes',
              'Sabado',
            ];
            const dayA = days.indexOf(a.day);
            const dayB = days.indexOf(b.day);
            return dayA - dayB;
          });
          return acc;
        }, []);
        ctx.patchState({ schedule: sortSchedule });
        ctx.patchState({ loading: false });
      }), // Provide an argument for the tap operator
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
  postClientsArray(
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
    ctx.patchState({ loading: true });
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
          ctx.patchState({ loading: false });
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
    ctx.patchState({ loading: true });
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
                      return {
                        ...hour,
                        clients: [...hour.clients, clientDetails.data._id],
                      };
                    }
                    return hour;
                  }),
                };
              });

              // Actualiza la lista de clientes en el estado
              const updatedClients = [...state.clients, clientDetails.data];

              ctx.patchState({
                clients: updatedClients,
                schedule,
                loading: false,
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
    ctx.patchState({ loading: true });
    const { page, pageSize, searchQ } = action.payload;
    let getAssignableClientsObservable: Observable<any>;

    if (searchQ === null || searchQ === undefined) {
      getAssignableClientsObservable =
        this.scheduleService.getClientsAssignable(page, pageSize, '');
    } else {
      getAssignableClientsObservable =
        this.scheduleService.getClientsAssignable(page, pageSize, searchQ);
    }

    return getAssignableClientsObservable.pipe(
      tap((response: any) => {
        const clientsAssignable = response.data.map((client: any) => ({
          ...client,
        }));
        const total = response.data.length;
        const pageCount = Math.ceil(total / pageSize);

        ctx.patchState({
          clientsAssignable,
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
      console.log('No se encontró el día con el horario especificado.');
      return;
    }

    // Encontrar el horario específico dentro del día
    const hourToEdit = dayToEdit.hours.find(
      (hour: any) => hour._id === action._id,
    );

    if (!hourToEdit) {
      console.log('No se encontró el horario especificado.');
      return;
    }

    // Actualizar el maxCount en el estado
    const maxCount = hourToEdit.maxCount;
    ctx.patchState({ maxCount });
  }
}
