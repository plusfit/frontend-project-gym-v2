import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UtilsService } from '@core/services/utils.service';
import { environment } from '../../../../environments/environment';
import { ISchedule, IScheduleResponse } from '../interfaces/schedule.interface';
import { Observable } from 'rxjs';

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

  getClientsAssignable(
    page: number,
    limit: number,
    name: string,
    email: string,
    CI: string,
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (name) {
      params = params.set('name', name);
    }
    if (email) {
      params = params.set('email', email);
    }
    if (CI) {
      params = params.set('CI', CI);
    }
    return this.http.get<any>(`${environment.api}/plans/assignableClients`, {
      params,
    });
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
  assignClientToHour(id: string, clients: string[]) {
    return this.http.patch<IScheduleResponse>(
      `${environment.api}/schedules/assignClient/${id}`,
      {
        clients,
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
