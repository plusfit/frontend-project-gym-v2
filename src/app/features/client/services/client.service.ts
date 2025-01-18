import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Client } from '../interface/clients.interface';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  constructor(private http: HttpClient) {}

  getClients(page: number, limit: number): Observable<any> {
    const url = `/clients?page=${page}&limit=${limit}`;
    return this.http.get<any>(`${environment.api}${url}`);
  }

  getClientsByName(
    page: number,
    limit: number,
    name?: string,
    email?: string,
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

    console.log(params.toString());

    return this.http.get<any>(`${environment.api}/clients`, {
      params,
    });
  }

  createClient(client: Client): Observable<any> {
    return this.http.post<any>(`${environment.api}/clients/create`, {
      userInfo: client,
    });
  }

  updateClient(id: string, client: Client): Observable<any> {
    return this.http.put<any>(`${environment.api}/clients/${id}`, {
      userInfo: client,
    });
  }

  deleteClient(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.api}/clients/${id}`);
  }
}
