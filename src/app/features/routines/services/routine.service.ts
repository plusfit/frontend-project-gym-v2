import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { UtilsService } from '@core/services/utils.service';
import { environment } from '../../../../environments/environment';
import { FiltersRoutine } from '../interfaces/filters.routine.interface';
import { RoutinePayload } from '../interfaces/routine.interface';

@Injectable({
  providedIn: 'root',
})
export class RoutineService {
  constructor(
    private http: HttpClient,
    private utilsService: UtilsService,
  ) {}

  getRoutinesByPage(page: number, limit: number): Observable<any> {
    const url = `/routines?page=${page}&limit=${limit}`;
    return this.http.get<any>(`${environment.api}${url}`);
  }
  getRoutinesByName(
    page: number,
    limit: number,
    filters: FiltersRoutine,
  ): Observable<any> {
    let url = `/routines?page=${page}&limit=${limit}`;
    if (filters.name) {
      url += `&name=${filters.name}`;
    }
    if (filters.type) {
      url += `&type=${filters.type}`;
    }
    return this.http.get<any>(`${environment.api}${url}`);
  }
  createRoutine(payload: RoutinePayload): Observable<any> {
    return this.http.post<any>(`${environment.api}/routines`, payload);
  }
  deleteRoutine(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.api}/routines/${id}`);
  }
  getRoutineById(id: string): Observable<any> {
    return this.http.get<any>(`${environment.api}/routines/${id}`);
  }
  updateRoutine(payload: RoutinePayload, id: string): Observable<any> {
    return this.http.patch<any>(`${environment.api}/routines/${id}`, payload);
  }
}
