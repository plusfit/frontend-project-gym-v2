import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "../../../../environments/environment";
import { getFriendlyErrorMessage } from "@core/utilities/helpers";
import {
  GymAccessRequest,
  GymAccessResponse,
  ApiResponse,
} from "../interfaces/special-access.interface";

@Injectable({
  providedIn: "root",
})
export class GymAccessService {
  private readonly apiUrl = `${environment.api}/gym-access`;

  constructor(private http: HttpClient) {}

  /**
   * Validates gym access for a client using their cedula
   * @param cedula - 8-digit Uruguayan ID
   * @returns Observable with access validation response
   */
  validateAccess(cedula: string): Observable<GymAccessResponse> {
    const request: GymAccessRequest = { cedula: cedula.trim() };

    return this.http.post<ApiResponse>(`${this.apiUrl}/validate`, request).pipe(
      map((response) => this.transformResponse(response)),
      catchError((error) => this.handleError(error)),
    );
  }

  /**
   * Validates cedula format (8 digits)
   * @param cedula - The cedula to validate
   * @returns boolean indicating if cedula is valid
   */
  isValidCedula(cedula: string): boolean {
    const cleanCedula = cedula.trim();
    return /^\d{8}$/.test(cleanCedula);
  }

  /**
   * Formats cedula for display (adds dots for readability)
   * @param cedula - The cedula to format
   * @returns formatted cedula string
   */
  formatCedula(cedula: string): string {
    const cleanCedula = cedula.replace(/\D/g, "");
    if (cleanCedula.length === 8) {
      return `${cleanCedula.substring(0, 1)}.${cleanCedula.substring(1, 4)}.${cleanCedula.substring(4, 7)}-${cleanCedula.substring(7)}`;
    }
    return cleanCedula;
  }

  /**
   * Transforms the API response to ensure consistency
   * @param response - Raw API response
   * @returns Transformed response
   */
  private transformResponse(response: ApiResponse): GymAccessResponse {
    if (response.success && response.data && typeof response.data === "object") {
      return {
        success: response.success,
        message: response.data.message || "Acceso procesado",
        authorize: response.data.authorize,
        client: response.data.client
          ? {
              name: response.data.client.name || "Cliente",
              photo: response.data.client.photo,
              plan: response.data.client.plan,
              consecutiveDays: response.data.client.consecutiveDays || 0,
              totalAccesses: response.data.client.totalAccesses || 0,
            }
          : undefined,
      };
    }

    // Handle denial responses (backend returns success: false but with client data)
    if (!response.success && response.data && typeof response.data === "object") {
      const denialType = this.determineDenialType(response.data.message || "");
      
      return {
        success: false,
        message: response.data.message || "Acceso denegado",
        authorize: response.data.authorize || false,
        client: response.data.client
          ? {
              name: response.data.client.name || "Cliente",
              photo: response.data.client.photo,
              plan: response.data.client.plan,
              consecutiveDays: response.data.client.consecutiveDays || 0,
              totalAccesses: response.data.client.totalAccesses || 0,
            }
          : undefined,
        denialType: denialType,
      };
    }

    // Handle denial responses (backend returns success: true but authorize: false)
    if (response.success && response.data && typeof response.data === "object" && response.data.authorize === false) {
      const denialType = this.determineDenialType(response.data.message || "");
      
      return {
        success: response.success,
        message: response.data.message || "Acceso denegado",
        authorize: response.data.authorize,
        client: response.data.client
          ? {
              name: response.data.client.name || "Cliente",
              photo: response.data.client.photo,
              plan: response.data.client.plan,
              consecutiveDays: response.data.client.consecutiveDays || 0,
              totalAccesses: response.data.client.totalAccesses || 0,
            }
          : undefined,
        denialType: denialType,
      };
    }

    if (!response.success && response.data && typeof response.data === "string") {
      // Error case with string data
      const denialType = this.determineDenialType(response.data);
      
      return {
        success: false,
        message: response.data,
        authorize: false,
        denialType: denialType,
      };
    }

    // Fallback for missing data
    return {
      success: false,
      message: "Error en la respuesta del servidor",
      authorize: false,
      denialType: 'system_error',
    };
  }

  /**
   * Determines the type of access denial based on the message
   * @param message - The denial message from the backend
   * @returns The type of denial
   */
  private determineDenialType(message: string): 'client_not_found' | 'client_disabled' | 'already_accessed' | 'outside_hours' | 'system_error' {
    const msg = message.toLowerCase();
    
    if (msg.includes("cliente no encontrado") || msg.includes("not found")) {
      return 'client_not_found';
    }
    
    if (msg.includes("deshabilitado") || msg.includes("disabled")) {
      return 'client_disabled';
    }
    
    if (msg.includes("ya registró acceso") || msg.includes("already accessed")) {
      return 'already_accessed';
    }
    
    if (msg.includes("fuera del horario") || msg.includes("operating hours")) {
      return 'outside_hours';
    }
    
    return 'system_error';
  }

  /**
   * Handle HTTP errors
   * @param error - HTTP error response
   * @returns Observable error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = error.error?.data || getFriendlyErrorMessage(error, "Error de validación");
    const denialType = this.determineDenialType(errorMessage);

    // Return error response in the expected format
    const errorResponse: GymAccessResponse = {
      success: false,
      message: "Error de validación",
      authorize: false,
      denialType: denialType,
    };

    return throwError(() => errorResponse);
  }
}
