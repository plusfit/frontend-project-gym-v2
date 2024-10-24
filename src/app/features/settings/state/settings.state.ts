import { Injectable } from '@angular/core';
import { UtilsService } from '@core/services/utils.service';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs';
import { Settings } from '../interfaces/settings.interface';
import { SettingsService } from '../services/settings.service';
import { CrateSettings, GetSettings } from './settings.actions';
import { SettingsStateModel } from './settings.model';

@State<SettingsStateModel>({
  name: 'settings',
  defaults: {
    settings: null,
    loading: false,
  },
})
@Injectable({ providedIn: 'root' })
export class SettingsState {
  @Selector()
  static settingsLoading(state: SettingsStateModel): boolean {
    return state?.loading || false;
  }

  @Selector()
  static settings(state: SettingsStateModel): Settings | null | undefined {
    return state.settings;
  }

  constructor(
    private settingsService: SettingsService,
    private utilsService: UtilsService,
  ) {}

  @Action(CrateSettings)
  createSettings(
    ctx: StateContext<SettingsStateModel>,
    { payload }: CrateSettings,
  ) {
    const token = localStorage.getItem('token') || ''; // Provide a default value for token if it is null
    return this.settingsService.createSettings(token, payload).pipe(
      tap((settings: any) => {
        ctx.patchState({ settings });
      }),
    );
  }

  @Action(GetSettings)
  getSettings(ctx: StateContext<SettingsStateModel>) {
    return this.settingsService.getSettings().pipe(
      tap((settings: any) => {
        ctx.patchState({ settings });
      }),
    );
  }
}
