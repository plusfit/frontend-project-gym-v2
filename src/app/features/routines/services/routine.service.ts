import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { UtilsService } from '@core/services/utils.service';
import { environment } from '../../../../environments/environment';
import { FiltersRoutine } from '../interfaces/filters.routine.interface';
import {
    RoutineApiResponse,
    RoutinePayload,
    RoutinesApiResponse,
    RoutinesBySubRoutineApiResponse
} from '../interfaces/routine.interface';

@Injectable({
  providedIn: 'root',
})
export class RoutineService {
  constructor(
    private http: HttpClient,
    private utilsService: UtilsService,
  ) {}

  getRoutinesByPage(
    page: number,
    limit: number,
    showOnScreen?: boolean,
  ): Observable<RoutinesApiResponse> {
    let url = `/routines?page=${page}&limit=${limit}`;
    if (showOnScreen !== undefined) {
      url += `&showOnScreen=${showOnScreen}`;
    }
    return this.http.get<RoutinesApiResponse>(`${environment.api}${url}`);
  }
  getRoutinesByName(
    page: number,
    limit: number,
    filters: FiltersRoutine,
  ): Observable<RoutinesApiResponse> {
    let url = `/routines?page=${page}&limit=${limit}`;
    if (filters.name) {
      url += `&name=${filters.name}`;
    }
    if (filters.type) {
      url += `&type=${filters.type}`;
    }
    return this.http.get<RoutinesApiResponse>(`${environment.api}${url}`);
  }
  createRoutine(payload: RoutinePayload): Observable<RoutineApiResponse> {
    return this.http.post<RoutineApiResponse>(`${environment.api}/routines`, payload);
  }
  deleteRoutine(id: string): Observable<RoutineApiResponse> {
    return this.http.delete<RoutineApiResponse>(
      `${environment.api}/routines/${id}`,
    );
  }
  getRoutineById(id: string): Observable<RoutineApiResponse> {
    return this.http.get<RoutineApiResponse>(
      `${environment.api}/routines/${id}`,
    );
  }
  updateRoutine(
    payload: RoutinePayload,
    id: string,
    clientId: string,
  ): Observable<RoutineApiResponse> {
    return this.http.put<RoutineApiResponse>(
      `${environment.api}/routines/${id}?clientId=${clientId}`,
      payload,
    );
  }
  getRoutinesBySubRoutine(
    id: string,
  ): Observable<RoutinesBySubRoutineApiResponse> {
    return this.http.get<RoutinesBySubRoutineApiResponse>(
      `${environment.api}/routines/routinesBySubroutine/${id}`,
    );
  }
}
