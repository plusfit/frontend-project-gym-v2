import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

import {
  Premio,
  PremioFilters,
  PremioResponse,
  CreatePremioRequest,
  UpdatePremioRequest,
  PremioApiResponse
} from '../interfaces/premio.interface';

@Injectable({
  providedIn: 'root'
})
export class PremiosService {
  private readonly apiUrl = `${environment.api}/premios`;

  constructor(private http: HttpClient) { }

  /**
   * Obtener todos los premios con filtros y paginación
   */
  getPremios(filters: PremioFilters = {}): Observable<PremioResponse> {
    let params = new HttpParams();
    
    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.enabled !== undefined) {
      params = params.set('enabled', filters.enabled.toString());
    }
    if (filters.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters.limit) {
      params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<PremioResponse>(this.apiUrl, { params });
  }

  /**
   * Obtener un premio por ID
   */
  getPremioById(id: string): Observable<{ success: boolean; data: Premio }> {
    return this.http.get<{ success: boolean; data: Premio }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear un nuevo premio
   */
  createPremio(premio: CreatePremioRequest): Observable<PremioApiResponse> {
    return this.http.post<PremioApiResponse>(this.apiUrl, premio);
  }

  /**
   * Actualizar un premio existente
   */
  updatePremio(id: string, premio: UpdatePremioRequest): Observable<PremioApiResponse> {
    return this.http.patch<PremioApiResponse>(`${this.apiUrl}/${id}`, premio);
  }

  /**
   * Habilitar/deshabilitar un premio
   */
  togglePremioEnabled(id: string): Observable<PremioApiResponse> {
    return this.http.patch<PremioApiResponse>(`${this.apiUrl}/${id}/toggle-enabled`, {});
  }

  /**
   * Eliminar un premio
   */
  deletePremio(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener catálogo público de premios habilitados
   */
  getCatalogoPremios(): Observable<{ success: boolean; data: Premio[] }> {
    return this.http.get<{ success: boolean; data: Premio[] }>(`${this.apiUrl}/catalog`);
  }
}