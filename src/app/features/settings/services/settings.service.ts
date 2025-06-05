/* eslint-disable prettier/prettier */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
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
    return this.http.post<{ success: boolean; data: Settings }>(
      `${environment.api}/config/create`,
      settings,
    ).pipe(map(response => ({ success: response.success, data: response.data })));
  }

  getSettings() {
    return this.http.get<{ success: boolean; data: Settings }>(`${environment.api}/config`)
      .pipe(map(response => ({ success: response.success, data: response.data })));
  }

  updateSettings(id: string, schedule: Settings) {
    return this.http.patch<SettingsResponse>(
      `${environment.api}/schedules/updateScheduleConfig/${id}`,
      { schedule },
    );
  }
}
