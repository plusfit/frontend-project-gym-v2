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
    if (response.success && response.data && typeof response.data === 'object') {
      // Success case with object data
      return {
        success: response.success,
        message: response.data.message || "Acceso procesado",
        client: response.data.client
          ? {
              name: response.data.client.name || "Cliente",
              photo: response.data.client.photo,
              plan: response.data.client.plan,
              consecutiveDays: response.data.client.consecutiveDays || 0,
              totalAccesses: response.data.client.totalAccesses || 0,
            }
          : undefined,
        reward: response.data.reward,
        reason: response.data.reason,
      };
    } 
    
    if (!response.success && response.data && typeof response.data === 'string') {
      // Error case with string data
      return {
        success: false,
        message: response.data,
        reason: response.data
      };
    }

    // Fallback for missing data
    return {
      success: false,
      message: "Error en la respuesta del servidor",
      reason: "Formato de respuesta inesperado",
    };
  }

  /**
   * Handle HTTP errors
   * @param error - HTTP error response
   * @returns Observable error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = error.error?.data || getFriendlyErrorMessage(error, "Error de validación");

    // Return error response in the expected format
    const errorResponse: GymAccessResponse = {
      success: false,
      message: "Error de validación",
      reason: errorMessage,
    };

    return throwError(() => errorResponse);
  }
}
