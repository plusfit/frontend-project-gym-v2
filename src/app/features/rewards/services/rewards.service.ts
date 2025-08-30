import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

import {
  Reward,
  RewardFilters,
  RewardResponse,
  CreateRewardRequest,
  UpdateRewardRequest,
  RewardApiResponse
} from '../interfaces/reward.interface';

@Injectable({
  providedIn: 'root'
})
export class RewardsService {
  private readonly apiUrl = `${environment.api}/rewards`;

  constructor(private http: HttpClient) { }

  /**
   * Obtener todos los premios con filtros y paginación
   */
  getRewards(filters: RewardFilters = {}): Observable<RewardResponse> {
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

    return this.http.get<RewardResponse>(this.apiUrl, { params });
  }

  /**
   * Obtener un premio por ID
   */
  getRewardById(id: string): Observable<{ success: boolean; data: Reward }> {
    return this.http.get<{ success: boolean; data: Reward }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear un nuevo premio
   */
  createReward(reward: CreateRewardRequest): Observable<RewardApiResponse> {
    return this.http.post<RewardApiResponse>(this.apiUrl, reward);
  }

  /**
   * Actualizar un premio existente
   */
  updateReward(id: string, reward: UpdateRewardRequest): Observable<RewardApiResponse> {
    return this.http.patch<RewardApiResponse>(`${this.apiUrl}/${id}`, reward);
  }

  /**
   * Habilitar/deshabilitar un premio
   */
  toggleRewardEnabled(id: string): Observable<RewardApiResponse> {
    return this.http.patch<RewardApiResponse>(`${this.apiUrl}/${id}/toggle-enabled`, {});
  }

  /**
   * Eliminar un premio
   */
  deleteReward(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener catálogo público de premios habilitados
   */
  getRewardsCatalog(): Observable<{ success: boolean; data: Reward[] }> {
    return this.http.get<{ success: boolean; data: Reward[] }>(`${this.apiUrl}/catalog`);
  }
}