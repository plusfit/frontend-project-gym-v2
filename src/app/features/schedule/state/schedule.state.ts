import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { ScheduleStateModel } from './schedule.model';
import { ScheduleService } from '../services/schedule.service';
import { UtilsService } from '@core/services/utils.service';
import { switchMap, tap } from 'rxjs';
import {
  AssignClient,
  ClearClients,
  DeleteClient,
  DeleteHour,
  getClientsArray,
  getClientsAssignable,
  GetClientsById,
  GetSchedule,
} from './schedule.actions';

@State<ScheduleStateModel>({
  name: 'schedule',
  defaults: {
    schedule: null,
    clients: [],
    clientsAssignable: [],
    loading: false,
  },
})
@Injectable({ providedIn: 'root' })
export class ScheduleState {
  constructor(
    private scheduleService: ScheduleService,
    private utilsService: UtilsService,
  ) {}

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
    return state?.clientsAssignable.data || [];
  }

  @Action(GetSchedule)
  getSchedule(ctx: StateContext<ScheduleStateModel>) {
    return this.scheduleService.getSchedule().pipe(
      tap((schedule: any) => {
        ctx.patchState({ schedule });
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

  @Action(getClientsArray)
  getClientsArray(
    ctx: StateContext<ScheduleStateModel>,
    action: getClientsArray,
  ) {
    return this.scheduleService.getClientsArray(action.ids).pipe(
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
      }),
    );
  }

  @Action(DeleteHour)
  deleteHour(ctx: StateContext<ScheduleStateModel>, action: DeleteHour) {
    return this.scheduleService.deleteHour(action._id).pipe(
      tap(() => {
        const state = ctx.getState();
        const schedule = state.schedule?.data?.filter(
          (hour: any) => hour._id !== action._id,
        );
        ctx.patchState({ schedule });
      }),
    );
  }

  @Action(AssignClient)
  assignClient(ctx: StateContext<ScheduleStateModel>, action: AssignClient) {
    ctx.patchState({ loading: true });
    return this.scheduleService
      .assignClientToHour(action._id, action.client)
      .pipe(
        switchMap(() =>
          this.scheduleService.getClientsByid(action.client).pipe(
            // Recuperar detalles del cliente
            tap((clientDetails) => {
              const state = ctx.getState();

              // Actualiza el cliente en el horario correspondiente
              const schedule = state.schedule?.data?.map((hour: any) => {
                if (hour._id === action._id) {
                  return {
                    ...hour,
                    client: clientDetails.data, // Incluye toda la información del cliente
                  };
                }
                return hour;
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
  getClientsAssignable(ctx: StateContext<ScheduleStateModel>) {
    return this.scheduleService.getClientsAssignable().pipe(
      tap((clients: any) => {
        ctx.patchState({ clientsAssignable: clients });
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
          const schedule = state.schedule?.data?.map((hour: any) => {
            if (hour._id === action._id) {
              return {
                ...hour,
                client: null,
              };
            }
            return hour;
          });
          const updatedClients = state.clients.filter(
            (client: any) => client._id !== action.client,
          );
          ctx.patchState({ clients: updatedClients });
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
}
