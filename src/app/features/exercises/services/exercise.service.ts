import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { UtilsService } from '@core/services/utils.service';
import { environment } from '../../../../environments/environment';

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
  getExercisesByName(name: string): Observable<any> {
    const url = `/exercises?name=${name}`;
    return this.http.get<any>(`${environment.api}${url}`);
  }
}
