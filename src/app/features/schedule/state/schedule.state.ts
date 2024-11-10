import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { ScheduleStateModel } from './schedule.model';
import { ScheduleService } from '../services/schedule.service';
import { UtilsService } from '@core/services/utils.service';
import { tap } from 'rxjs';
import { GetSchedule } from './schedule.actions';

@State<ScheduleStateModel>({
  name: 'schedule',
  defaults: {
    schedule: null,
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

  @Action(GetSchedule)
  getSchedule(ctx: StateContext<ScheduleStateModel>) {
    return this.scheduleService.getSchedule().pipe(
      tap((schedule: any) => {
        ctx.patchState({ schedule });
      }),
    );
  }
}
