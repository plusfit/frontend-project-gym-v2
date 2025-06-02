import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Organization,
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from '../interfaces/organization.interface';

@Injectable({
  providedIn: 'root',
})
export class OrganizationsService {
  private readonly apiUrl = `${environment.api}/organizations`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Organization[]> {
    return this.http.get<Organization[]>(this.apiUrl);
  }

  getById(id: string): Observable<Organization> {
    return this.http.get<Organization>(`${this.apiUrl}/${id}`);
  }

  getBySlug(slug: string): Observable<Organization> {
    return this.http.get<Organization>(`${this.apiUrl}/slug/${slug}`);
  }

  create(organization: CreateOrganizationDto): Observable<Organization> {
    return this.http.post<Organization>(this.apiUrl, organization);
  }

  update(
    id: string,
    organization: UpdateOrganizationDto,
  ): Observable<Organization> {
    return this.http.patch<Organization>(`${this.apiUrl}/${id}`, organization);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
