import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UtilsService } from '@core/services/utils.service';
import { environment } from '../../../../environments/environment';

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

  updateSchedule(id: string, schedule: any) {
    return this.http.patch<any>(`${environment.api}/schedules/${id}`, {
      schedule,
    });
  }

  deleteHour(id: string) {
    return this.http.delete<any>(`${environment.api}/schedules/${id}`);
  }
}
