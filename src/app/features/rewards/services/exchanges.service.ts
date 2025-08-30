import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

import {
  Exchange,
  ExchangeFilters,
  ExchangeResponse,
  CreateExchangeRequest,
  ExchangeResult
} from '../interfaces/exchange.interface';

@Injectable({
  providedIn: 'root'
})
export class ExchangesService {
  private readonly baseUrl = `${environment.api}/rewards`;

  constructor(private http: HttpClient) { }

  // Obtener historial de canjes con filtros
  getExchanges(filters: ExchangeFilters): Observable<ExchangeResponse> {
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

    return this.http.get<ExchangeResponse>(`${this.baseUrl}/exchanges/history`, { params });
  }

  // Alias para compatibilidad
  getExchangeHistory(filters: ExchangeFilters): Observable<ExchangeResponse> {
    return this.getExchanges(filters);
  }

  /**
   * Obtener un canje por ID
   */
  getExchangeById(id: string): Observable<{ success: boolean; data: Exchange }> {
    return this.http.get<{ success: boolean; data: Exchange }>(`${this.baseUrl}/exchanges/${id}`);
  }

  /**
   * Realizar un canje de premio
   */
  createExchange(exchange: CreateExchangeRequest): Observable<ExchangeResult> {
    return this.http.post<ExchangeResult>(`${this.baseUrl}/exchange`, exchange);
  }

  /**
   * Obtener canjes de un cliente específico
   */
  getClientExchanges(clientId: string): Observable<{ success: boolean; data: Exchange[] }> {
    return this.http.get<{ success: boolean; data: Exchange[] }>(`${this.baseUrl}/exchanges/client/${clientId}`);
  }
}