/* eslint-disable prettier/prettier */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UtilsService } from '@core/services/utils.service';
import { Settings, SettingsResponse } from '../interfaces/settings.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor(
    private http: HttpClient,
    private utilsService: UtilsService,
  ) {}

  createSettings(settings: Settings) {
    return this.http.post<SettingsResponse>(
      `${environment.api}/config/create`,
      settings,
    );
  }

  getSettings() {
    return this.http.get<SettingsResponse>(`${environment.api}/config`);
  }

  updateSettings(id: string, schedule: Settings) {
    return this.http.patch<SettingsResponse>(
      `${environment.api}/schedules/updateScheduleConfig/${id}`,
      { schedule },
    );
  }
}
