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
    hourId: string,
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

    if (hourId) {
      params = params.set('hourId', hourId);
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

  // Métodos para manejar días deshabilitados
  getDisabledDays(): Observable<any> {
    // Por ahora usamos localStorage como persistencia temporal
    // En producción esto debería ser una llamada al backend
    const disabledDays = JSON.parse(
      localStorage.getItem('disabledDays') || '[]',
    );
    return new Observable((observer) => {
      observer.next({ data: { disabledDays } });
      observer.complete();
    });
  }

  updateDisabledDays(disabledDays: string[], reason?: string): Observable<any> {
    // Por ahora guardamos en localStorage hasta que el backend tenga endpoint para días completos
    // El endpoint actual toggle-schedule/:id es para horarios específicos, no días completos
    const data = { disabledDays, reason };
    localStorage.setItem('disabledDays', JSON.stringify(disabledDays));

    // Si hay razón, también la guardamos para referencia futura
    if (reason) {
      const savedReasons = JSON.parse(
        localStorage.getItem('disabledDaysReasons') || '{}',
      );
      disabledDays.forEach((day) => {
        savedReasons[day] = reason;
      });
      localStorage.setItem('disabledDaysReasons', JSON.stringify(savedReasons));
    }

    return new Observable((observer) => {
      observer.next({ data });
      observer.complete();
    });
  }

  // Método para toggle individual de horarios (usando el endpoint del backend)
  toggleScheduleDisabled(
    scheduleId: string,
    disabled: boolean,
    disabledReason?: string,
  ): Observable<any> {
    const payload: { disabled: boolean; disabledReason?: string } = {
      disabled,
    };

    if (disabledReason) {
      payload.disabledReason = disabledReason;
    }

    return this.http
      .patch(`${environment.api}/schedules/toggle-schedule/${scheduleId}`, payload)
      .pipe(
        // Aquí puedes agregar operadores RxJS adicionales si es necesario
      );
  }
}
