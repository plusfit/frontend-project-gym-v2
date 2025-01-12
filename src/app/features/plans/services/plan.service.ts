import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Plan,
  PlanApiResponse,
} from '@features/plans/interfaces/plan.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PlansService {
  constructor(private http: HttpClient) {}

  getPlans(
    page: number,
    limit: number,
    name?: string,
    plansType?: string,
  ): Observable<PlanApiResponse[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (name) {
      params = params.set('name', name);
    }

    if (plansType) {
      params = params.set('plansType', plansType);
    }

    return this.http.get<PlanApiResponse[]>(`${environment.api}/plans`, {
      params,
    });
  }

  getPlan(id: string): Observable<Plan> {
    const url = `${environment.api}/plans/${id}`;
    return this.http.get<Plan>(url);
  }

  createPlan(plan: Plan): Observable<Plan> {
    const url = `${environment.api}/plans/create`;
    return this.http.post<Plan>(url, plan);
  }

  updatePlan(id: string, plan: Plan): Observable<Plan> {
    const url = `${environment.api}/plans/${id}`;
    return this.http.patch<Plan>(url, plan);
  }

  deletePlan(id: string): Observable<void> {
    const url = `${environment.api}/plans/${id}`;
    return this.http.delete<void>(url);
  }

  findPlansByUserId(userId: string): Observable<Plan[]> {
    const url = `${environment.api}/plans/user/${userId}`;
    return this.http.get<Plan[]>(url);
  }

  assignPlanToUser(
    planId: string,
    userId: string,
  ): Observable<{ message: string }> {
    const url = `${environment.api}/plans/assign/${planId}/${userId}`;
    return this.http.post<{ message: string }>(url, {});
  }

  findAssignableClients(
    page: number,
    limit: number,
    email?: string,
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (email) {
      params = params.set('email', email);
    }

    return this.http.get<any>(`${environment.api}/plans/assignableClients`, {
      params,
    });
  }
}
