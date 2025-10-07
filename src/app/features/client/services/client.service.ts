import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { Client, UserPasswordResponse } from "../interface/clients.interface";

@Injectable({
  providedIn: "root",
})
export class ClientService {
  constructor(private http: HttpClient) {}

  getClients(page: number, limit: number): Observable<any> {
    const url = `/clients?page=${page}&limit=${limit}`;
    return this.http.get<any>(`${environment.api}${url}`);
  }

  getClientById(id: string): Observable<any> {
    return this.http.get<any>(`${environment.api}/clients/${id}`);
  }

  getClientsByName(
    page: number,
    limit: number,
    name?: string,
    email?: string,
    role?: string,
    CI?: string,
    withoutPlan?: boolean,
    disabled?: boolean,
  ): Observable<any> {
    let params = new HttpParams().set("page", page.toString()).set("limit", limit.toString());

    if (withoutPlan) {
      params = params.set("withoutPlan", withoutPlan);
    }

    if (CI) {
      params = params.set("CI", CI);
    }

    if (role) {
      params = params.set("role", role);
    }

    if (name) {
      params = params.set("name", name);
    }

    if (email) {
      params = params.set("email", email);
    }

    if (disabled !== undefined) {
      params = params.set("disabled", disabled);
    }

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
    return this.http.patch<any>(`${environment.api}/clients/${id}`, {
      userInfo: client,
    });
  }

  deleteClient(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.api}/clients/${id}`);
  }

  // Nuevo método para eliminar solo de MongoDB (después de eliminar de Firebase)
  deleteClientFromMongoDB(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.api}/clients/${id}`);
  }

  toggleDisabledClient(id: string, disabled: boolean): Observable<any> {
    return this.http.patch<any>(`${environment.api}/clients/${id}/disabled`, {
      disabled,
    });
  }

  getActiveClientsCount(): Observable<{ success: boolean; data: number }> {
    return this.http.get<{ success: boolean; data: number }>(
      `${environment.api}/clients/count/active`,
    );
  }

  getUserPassword(clientId: string, adminCode: string): Observable<UserPasswordResponse> {
    return this.http.get<UserPasswordResponse>(`${environment.api}/clients/${clientId}/password`, {
      params: { adminCode },
    });
  }

  // Método para obtener la contraseña para operaciones internas (sin código de administrador)
  getUserPasswordForInternalOperations(clientId: string): Observable<UserPasswordResponse> {
    return this.http.get<UserPasswordResponse>(`${environment.api}/clients/${clientId}/password`);
  }

  sendForgotPasswordEmail(clientId: string): Observable<{success: boolean; message: string}> {
    return this.http.post<{success: boolean; message: string}>(`${environment.api}/clients/${clientId}/forgot-password`, {});
  }
}
