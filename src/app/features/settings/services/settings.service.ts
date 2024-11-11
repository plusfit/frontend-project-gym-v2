/* eslint-disable prettier/prettier */
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  createSettings(token: string, settings: Settings) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Añade el token en los encabezados
      'Content-Type': 'application/json',
    });
    return this.http.post<SettingsResponse>(
      ` ${environment.api}/config/create`,
      settings,
      { headers },
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
