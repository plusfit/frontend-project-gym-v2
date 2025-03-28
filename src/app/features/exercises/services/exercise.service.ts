import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { UtilsService } from '@core/services/utils.service';
import { environment } from '../../../../environments/environment';
import { FiltersExercise } from '../interfaces/filters.excersise.interface';
import { ExercisePayload } from '../interfaces/exercise.interface';

@Injectable({
  providedIn: 'root',
})
export class ExerciseService {
  constructor(
    private http: HttpClient,
    private utilsService: UtilsService,
  ) {}

  getExercisesByPage(page: number, limit: number): Observable<any> {
    const url = `/exercises?page=${page}&limit=${limit}`;
    return this.http.get<any>(`${environment.api}${url}`);
  }
  getExercisesByName(
    page: number,
    limit: number,
    filters: FiltersExercise,
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters.name) {
      params = params.set('name', filters.name);
    }

    if (filters.type) {
      params = params.set('type', filters.type);
    }

    if (filters.categorie) {
      params = params.set('categorie', filters.categorie);
    }

    return this.http.get<any>(`${environment.api}/exercises`, {
      params,
    });
  }
  createExercise(payload: ExercisePayload): Observable<any> {
    return this.http.post<any>(`${environment.api}/exercises`, payload);
  }
  deleteExercise(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.api}/routines/exercise/${id}`);
  }
  getExerciseById(id: string): Observable<any> {
    return this.http.get<any>(`${environment.api}/exercises/${id}`);
  }
  updateExercise(payload: ExercisePayload, id: string): Observable<any> {
    return this.http.patch<any>(`${environment.api}/exercises/${id}`, payload);
  }
}
