import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { UtilsService } from '@core/services/utils.service';
import { environment } from '../../../../environments/environment';
import { FiltersRoutine } from '../interfaces/filters.routine.interface';
import {
  Routine,
  RoutineApiResponse,
  RoutinePayload,
  RoutinesApiResponse,
  RoutinesBySubRoutineApiResponse,
} from '../interfaces/routine.interface';
import { SubRoutineApiResponse } from '@features/sub-routines/interfaces/sub-routine.interface';

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
  ): Observable<RoutinesApiResponse> {
    const url = `/routines?page=${page}&limit=${limit}`;
    return this.http.get<any>(`${environment.api}${url}`);
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
    return this.http.get<any>(`${environment.api}${url}`);
  }
  createRoutine(payload: RoutinePayload): Observable<any> {
    return this.http.post<any>(`${environment.api}/routines`, payload);
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
    idClient: string,
  ): Observable<any> {
    return this.http.put<any>(
      `${environment.api}/routines/${id}?idClient=${idClient}`,
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
