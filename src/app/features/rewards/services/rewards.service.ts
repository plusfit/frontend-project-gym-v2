import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { environment } from '../../../../environments/environment';

import {
  Storage,
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from '@angular/fire/storage';
import {
  CreateRewardRequest,
  Reward,
  RewardApiResponse,
  RewardFilters,
  RewardResponse,
  UpdateRewardRequest
} from '../interfaces/reward.interface';

@Injectable({
  providedIn: 'root'
})
export class RewardsService {
  private readonly apiUrl = `${environment.api}/rewards`;

  constructor(
    private http: HttpClient,
    private storage: Storage,
  ) { }

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

  /**
   * Subir archivo de imagen a Firebase Storage
   */
  uploadRewardImage(file: File): Observable<import('@angular/fire/storage').UploadResult> {
    const storageRef = ref(this.storage, `rewards/${this.getRandomUid()}`);
    return from(uploadBytes(storageRef, file));
  }

  /**
   * Eliminar imagen de Firebase Storage
   */
  deleteRewardImage(imagePath: string): Observable<void> {
    const storageRef = ref(this.storage, imagePath);
    return from(deleteObject(storageRef));
  }

  /**
   * Obtener URL de descarga del archivo
   */
  getFileUrl(ref: import('@angular/fire/storage').StorageReference): Observable<string> {
    return from(getDownloadURL(ref));
  }

  /**
   * Generar UID único para el archivo
   */
  private getRandomUid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }
}