import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SubRoutine,
  SubRoutineApiResponse,
} from '@features/sub-routines/interfaces/sub-routine.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SubRoutineService {
  constructor(private http: HttpClient) {}

  getSubRoutines(
    page: number,
    limit: number,
    name?: string,
    type?: string,
    mode?: string,
  ): Observable<SubRoutineApiResponse[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (name) {
      params = params.set('name', name);
    }

    if (type) {
      params = params.set('type', type);
    }

    if (mode) {
      params = params.set('mode', mode);
    }

    return this.http.get<SubRoutineApiResponse[]>(
      `${environment.api}/routines/subRoutine`,
      {
        params,
      },
    );
  }

  getSubRoutine(id: string): Observable<SubRoutine> {
    const url = `${environment.api}/routines/subRoutine/${id}`;
    return this.http.get<SubRoutine>(url);
  }

  updateSubRoutine(id: string, subRoutine: SubRoutine): Observable<SubRoutine> {
    const url = `${environment.api}/routines/subRoutine/${id}`;
    return this.http.put<SubRoutine>(url, subRoutine);
  }

  createSubRoutine(subRoutine: SubRoutine): Observable<SubRoutine> {
    const url = `${environment.api}/routines/subRoutine`;
    return this.http.post<SubRoutine>(url, subRoutine);
  }

  deleteSubRoutine(id: string): Observable<SubRoutine> {
    const url = `${environment.api}/routines/subRoutine/${id}`;
    return this.http.delete<SubRoutine>(url);
  }
}
