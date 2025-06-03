import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Organization,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  UpdateOrganizationPermissionsDto,
} from '../interfaces/organization.interface';
import { Permission, Module } from '@core/enums/permissions.enum';
import { Plan } from '@features/plans/interfaces/plan.interface';
import { Client } from '@features/client/interface/clients.interface';
import { Routine } from '@features/routines/interfaces/routine.interface';

@Injectable({
  providedIn: 'root',
})
export class OrganizationsService {
  private readonly apiUrl = `${environment.api}/organizations`;

  constructor(private http: HttpClient) {}

  getAll(includeInactive = true): Observable<Organization[]> {
    const params = includeInactive
      ? '?includeInactive=true'
      : '?includeInactive=false';
    return this.http.get<Organization[]>(`${this.apiUrl}${params}`);
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

  getOrganizationPlans(organizationId: string): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.apiUrl}/${organizationId}/plans`);
  }

  getOrganizationClients(organizationId: string): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/${organizationId}/clients`);
  }

  getOrganizationRoutines(organizationId: string): Observable<Routine[]> {
    return this.http.get<Routine[]>(
      `${this.apiUrl}/${organizationId}/routines`,
    );
  }

  updateOrganizationPermissions(
    organizationId: string,
    permissions: UpdateOrganizationPermissionsDto,
  ): Observable<Organization> {
    return this.http.patch<Organization>(
      `${this.apiUrl}/${organizationId}/permissions`,
      permissions,
    );
  }

  getOrganizationPermissions(organizationId: string): Observable<Permission[]> {
    return this.http.get<Permission[]>(
      `${this.apiUrl}/${organizationId}/permissions`,
    );
  }

  getOrganizationPermissionsByModule(
    organizationId: string,
    module: Module,
  ): Observable<Permission[]> {
    return this.http.get<Permission[]>(
      `${this.apiUrl}/${organizationId}/permissions/${module}`,
    );
  }
}
