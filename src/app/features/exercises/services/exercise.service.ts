import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';

import { UtilsService } from '@core/services/utils.service';
import { environment } from '../../../../environments/environment';
import { FiltersExercise } from '../interfaces/filters.excersise.interface';
import { ExercisePayload } from '../interfaces/exercise.interface';
import {
  deleteObject,
  getDownloadURL,
  ref,
  Storage,
  uploadBytes,
} from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class ExerciseService {
  constructor(
    private http: HttpClient,
    private utilsService: UtilsService,
    private storage: Storage,
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
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters.name) {
      params = params.set('name', filters.name);
    }

    if (filters.type) {
      params = params.set('type', filters.type);
    }

    if (filters.category) {
      params = params.set('category', filters.category);
    }

    return this.http.get<any>(`${environment.api}/exercises`, {
      params,
    });
  }

  saveExcerciseFile(file: any) {
    const storageRef = ref(this.storage, `excercises/${this.getRandomUid()}`);
    return from(uploadBytes(storageRef, file));
  }

  deleteGift(imagePath: string) {
    const storageRef = ref(this.storage, imagePath);
    return from(deleteObject(storageRef));
  }

  getFileUrl(ref: any) {
    return from(getDownloadURL(ref));
  }

  getRandomUid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }
  createExercise(payload: ExercisePayload): Observable<any> {
    return this.http.post<any>(`${environment.api}/exercises`, payload);
  }
  deleteExercise(id: string, imagePath: string): Observable<any> {
    this.deleteGift(imagePath);
    return this.http.delete<any>(`${environment.api}/routines/exercise/${id}`);
  }
  getExerciseById(id: string): Observable<any> {
    return this.http.get<any>(`${environment.api}/exercises/${id}`);
  }
  updateExercise(payload: ExercisePayload, id: string): Observable<any> {
    return this.http.patch<any>(`${environment.api}/exercises/${id}`, payload);
  }
}
