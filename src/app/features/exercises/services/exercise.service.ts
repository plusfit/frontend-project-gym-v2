import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { UtilsService } from '@core/services/utils.service';
import { environment } from '../../../../environments/environment';
import { FiltersExercise } from '../interfaces/filters.excersise.interface';

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
    let url = `/exercises?page=${page}&limit=${limit}`;
    if (filters.name) {
      url += `&name=${filters.name}`;
    }
    if (filters.type) {
      url += `&type=${filters.type}`;
    }
    if (filters.mode) {
      url += `&mode=${filters.mode}`;
    }
    return this.http.get<any>(`${environment.api}${url}`);
  }
}
