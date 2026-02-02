import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

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
      params = params.set('showOnScreen', 'true');
    } else {
      params = params.set('showOnScreen', 'false');
    }

    return this.http.get<any>(`${environment.api}/routines`, {
      params,
    });
  }
}
