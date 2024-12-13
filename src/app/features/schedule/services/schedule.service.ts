import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UtilsService } from '@core/services/utils.service';
import { environment } from '../../../../environments/environment';
import { ISchedule, IScheduleResponse } from '../interfaces/schedule.interface';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  constructor(
    private http: HttpClient,
    private utilsService: UtilsService,
  ) {}

  getSchedule() {
    return this.http.get<any>(`${environment.api}/schedules`);
  }

  getClientsByid(id: string) {
    return this.http.get<any>(`${environment.api}/clients/${id}`);
  }

  getClientsAssignable() {
    return this.http.get<any>(`${environment.api}/plans/assignableClients`);
  }

  postClientsArray(clientsIds: string[]) {
    return this.http.post<any>(`${environment.api}/clients/list`, {
      clientsIds,
    });
  }

  updateSchedule(id: string, data: ISchedule) {
    return this.http.patch<IScheduleResponse>(
      `${environment.api}/schedules/${id}`,
      data,
    );
  }
  assignClientToHour(id: string, client: string) {
    return this.http.patch<IScheduleResponse>(
      `${environment.api}/schedules/assignClient/${id}/${client}`,
      {
        client,
      },
    );
  }

  deleteClientFromHour(id: string, client: string) {
    return this.http.delete<any>(
      `${environment.api}/schedules/deleteClient/${id}/${client}`,
      {
        body: {
          client,
        },
      },
    );
  }

  deleteHour(id: string) {
    return this.http.delete<any>(`${environment.api}/schedules/${id}`);
  }
}
