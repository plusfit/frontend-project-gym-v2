import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { ScheduleStateModel } from './schedule.model';
import { ScheduleService } from '../services/schedule.service';
import { UtilsService } from '@core/services/utils.service';
import { tap } from 'rxjs';
import { DeleteHour, GetClientsById, GetSchedule } from './schedule.actions';

@State<ScheduleStateModel>({
  name: 'schedule',
  defaults: {
    schedule: null,
    clients: null,
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

  @Action(GetSchedule)
  getSchedule(ctx: StateContext<ScheduleStateModel>) {
    return this.scheduleService.getSchedule().pipe(
      tap((schedule: any) => {
        ctx.patchState({ schedule });
      }),
    );
  }

  @Action(GetClientsById)
  getClientsById(
    ctx: StateContext<ScheduleStateModel>,
    action: GetClientsById,
  ) {
    return this.scheduleService.getClientsByid(action._id).pipe(
      tap((clients: any) => {
        ctx.patchState({ clients });
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
}
