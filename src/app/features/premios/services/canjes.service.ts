import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

import {
  Canje,
  CanjeFilters,
  CanjeResponse,
  CreateCanjeRequest,
  CanjeResult
} from '../interfaces/canje.interface';

@Injectable({
  providedIn: 'root'
})
export class CanjesService {
  private readonly apiUrl = `${environment.api}/canjes`;

  constructor(private http: HttpClient) { }

  // Obtener historial de canjes con filtros
  getCanjes(filters: CanjeFilters): Observable<CanjeResponse> {
    let params = new HttpParams();
    
    if (filters.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters.limit) {
      params = params.set('limit', filters.limit.toString());
    }
    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.status && filters.status !== 'all') {
      params = params.set('status', filters.status);
    }
    if (filters.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom.toISOString());
    }
    if (filters.dateTo) {
      params = params.set('dateTo', filters.dateTo.toISOString());
    }
    if (filters.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }
    if (filters.sortOrder) {
      params = params.set('sortOrder', filters.sortOrder);
    }

    return this.http.get<CanjeResponse>(`${this.apiUrl}`, { params });
  }

  // Alias para compatibilidad
  getCanjeHistory(filters: CanjeFilters): Observable<CanjeResponse> {
    return this.getCanjes(filters);
  }

  /**
   * Obtener un canje por ID
   */
  getCanjeById(id: string): Observable<{ success: boolean; data: Canje }> {
    return this.http.get<{ success: boolean; data: Canje }>(`${this.apiUrl}/canjes/${id}`);
  }

  /**
   * Realizar un canje de premio
   */
  realizarCanje(canje: CreateCanjeRequest): Observable<CanjeResult> {
    return this.http.post<CanjeResult>(`${this.apiUrl}/canje`, canje);
  }

  /**
   * Obtener canjes de un cliente específico
   */
  getCanjesCliente(clienteId: string): Observable<{ success: boolean; data: Canje[] }> {
    return this.http.get<{ success: boolean; data: Canje[] }>(`${this.apiUrl}/canjes/cliente/${clienteId}`);
  }
}