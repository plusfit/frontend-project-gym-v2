import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ScreenRoutineService {
  constructor(private http: HttpClient) {}
  getScreenRoutines(
    limit: number,
    page: number,
    isGeneral?: boolean,
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (isGeneral) {
      params = params.set('isGeneral', isGeneral);
    }
    return this.http.get<any>(`${environment.api}/routines`, {
      params,
    });
  }
}
