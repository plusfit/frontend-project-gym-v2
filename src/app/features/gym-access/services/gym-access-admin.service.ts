import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, tap, map } from "rxjs/operators";
import { environment } from "../../../../environments/environment";
import {
  GymAccessHistoryResponse,
  WrappedGymAccessHistoryResponse,
  ClientAccessHistoryResponse,
  AccessFilters,
  ExportOptions,
  AccessStats,
} from "../interfaces/gym-access-admin.interface";

@Injectable({
  providedIn: "root",
})
export class GymAccessAdminService {
  private readonly apiUrl = `${environment.api}/gym-access`;

  constructor(private http: HttpClient) {}

  /**
   * Get paginated gym access history with filters
   * @param filters - Filters to apply to the search
   * @returns Observable with access history response
   */
  getAccessHistory(filters: AccessFilters): Observable<GymAccessHistoryResponse> {
    let params = new HttpParams()
      .set("page", filters.page.toString())
      .set("limit", filters.limit.toString());

    // Ensure dates are in YYYY-MM-DD format for backend compatibility
    if (filters.startDate) {
      const formattedStartDate = this.ensureDateFormat(filters.startDate);
      params = params.set("startDate", formattedStartDate);
    }

    if (filters.endDate) {
      const formattedEndDate = this.ensureDateFormat(filters.endDate);
      params = params.set("endDate", formattedEndDate);
    }

    if (filters.clientName && filters.clientName.trim()) {
      params = params.set("clientName", filters.clientName.trim());
    }

    // Ensure successful is sent as proper boolean string
    if (filters.successful !== undefined && filters.successful !== null) {
      params = params.set("successful", filters.successful.toString());
    }

    if (filters.cedula && filters.cedula.trim()) {
      params = params.set("cedula", filters.cedula.trim());
    }

    const url = `${this.apiUrl}/history`;

    return this.http
      .get<GymAccessHistoryResponse | WrappedGymAccessHistoryResponse>(url, { params })
      .pipe(
        map((response) => {
          // Handle wrapped response format first (most common from backend)
          if ((response as any).success !== undefined && (response as any).data) {
            const wrappedData = (response as WrappedGymAccessHistoryResponse).data;
            if (wrappedData.history) {
              wrappedData.history = wrappedData.history.map((item) => ({
                ...item,
                successful: this.normalizeSuccessfulField(item.successful),
              }));
            }
            return wrappedData;
          }

          // Handle direct response format
          if ((response as any).history && (response as any).pagination) {
            const directResponse = response as GymAccessHistoryResponse;
            // Normalize successful field in history items
            if (directResponse.history) {
              directResponse.history = directResponse.history.map((item) => ({
                ...item,
                successful: this.normalizeSuccessfulField(item.successful),
              }));
            }
            return directResponse;
          }

          // Handle unexpected format
          return {
            history: [],
            pagination: {
              currentPage: 1,
              totalPages: 0,
              totalCount: 0,
              limit: 10,
            },
          } as GymAccessHistoryResponse;
        }),

        catchError((error) => {
          return this.handleError(error);
        }),
      );
  }

  /**
   * Get access history for a specific client
   * @param cedula - Client's cedula/ID number
   * @returns Observable with client access history
   */
  getClientAccessHistory(cedula: string): Observable<ClientAccessHistoryResponse> {
    return this.http
      .get<ClientAccessHistoryResponse>(`${this.apiUrl}/client/${cedula}/history`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Get access statistics with optional filters
   * @param filters - Optional filters to apply to statistics
   * @returns Observable with access statistics
   */
  getStats(filters?: Partial<AccessFilters>): Observable<AccessStats> {
    let params = new HttpParams();

    if (filters) {
      if (filters.cedula && filters.cedula.trim()) {
        params = params.set("cedula", filters.cedula.trim());
      }
      if (filters.clientName && filters.clientName.trim()) {
        params = params.set("clientName", filters.clientName.trim());
      }
      // Ensure successful is sent as proper boolean string
      if (filters.successful !== undefined && filters.successful !== null) {
        params = params.set("successful", filters.successful.toString());
      }
      // Handle date formatting - dates can come as Date objects or strings
      if (filters.startDate) {
        let formattedStartDate: string;

        // TypeScript doesn't know it can be Date, so we check using duck typing
        if (typeof filters.startDate === "object" && "getFullYear" in filters.startDate) {
          // It's a Date object
          formattedStartDate = this.ensureDateFormat(filters.startDate as Date);
        } else {
          // It's already a string
          formattedStartDate = this.ensureDateFormat(filters.startDate);
        }

        params = params.set("startDate", `${formattedStartDate}T00:00:00.000Z`);
      }
      if (filters.endDate) {
        let formattedEndDate: string;

        // TypeScript doesn't know it can be Date, so we check using duck typing
        if (typeof filters.endDate === "object" && "getFullYear" in filters.endDate) {
          // It's a Date object
          formattedEndDate = this.ensureDateFormat(filters.endDate as Date);
        } else {
          // It's already a string
          formattedEndDate = this.ensureDateFormat(filters.endDate);
        }

        params = params.set("endDate", `${formattedEndDate}T23:59:59.999Z`);
      }
    }

    return this.http
      .get<{ success: boolean; data: AccessStats }>(`${this.apiUrl}/stats`, { params })
      .pipe(
        map((response) => {
          return response.data;
        }),
        catchError((error) => {
          return this.handleError(error);
        }),
      );
  }

  /**
   * Export access history data
   * @param options - Export options including format and filters
   * @returns Observable with blob data for download
   */
  exportAccessHistory(options: ExportOptions): Observable<Blob> {
    let params = new HttpParams()
      .set("format", options.format)
      .set("page", options.filters.page.toString())
      .set("limit", options.filters.limit.toString());

    // Ensure dates are in YYYY-MM-DD format for backend compatibility
    if (options.filters.startDate) {
      const formattedStartDate = this.ensureDateFormat(options.filters.startDate);
      params = params.set("startDate", formattedStartDate);
    }

    if (options.filters.endDate) {
      const formattedEndDate = this.ensureDateFormat(options.filters.endDate);
      params = params.set("endDate", formattedEndDate);
    }

    if (options.filters.clientName && options.filters.clientName.trim()) {
      params = params.set("clientName", options.filters.clientName.trim());
    }

    // Ensure successful is sent as proper boolean string
    if (options.filters.successful !== undefined && options.filters.successful !== null) {
      params = params.set("successful", options.filters.successful.toString());
    }

    if (options.filters.cedula && options.filters.cedula.trim()) {
      params = params.set("cedula", options.filters.cedula.trim());
    }

    return this.http
      .get(`${this.apiUrl}/export`, {
        params,
        responseType: "blob",
      })
      .pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Search clients by name or cedula for autocomplete
   * @param query - Search query
   * @returns Observable with matching clients
   */
  searchClients(query: string): Observable<any> {
    const params = new HttpParams().set("q", query);

    return this.http
      .get(`${this.apiUrl}/search/clients`, { params })
      .pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Get popular access times for visualization
   * @param days - Number of days to analyze (default: 30)
   * @returns Observable with popular times data
   */
  getPopularTimes(days: number = 30): Observable<any> {
    const params = new HttpParams().set("days", days.toString());

    return this.http
      .get(`${this.apiUrl}/popular-times`, { params })
      .pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Get top performing clients
   * @param period - Period to analyze ('week', 'month', 'year')
   * @param limit - Number of top clients to return
   * @returns Observable with top clients data
   */
  getTopClients(period: string = "month", limit: number = 10): Observable<any> {
    const params = new HttpParams().set("period", period).set("limit", limit.toString());

    return this.http
      .get(`${this.apiUrl}/top-clients`, { params })
      .pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Download access report as file
   * @param blob - Blob data
   * @param filename - Name for the downloaded file
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Test backend connectivity
   * @returns Observable with connectivity test result
   */
  testConnectivity(): Observable<any> {
    const testUrl = `${environment.api}/health`;

    const requestStart = performance.now();

    return this.http
      .get(testUrl, {
        headers: { "Content-Type": "application/json" },
        observe: "response",
      })
      .pipe(
        map((response) => {
          const requestTime = performance.now() - requestStart;

          return {
            success: true,
            status: response.status,
            responseTime: requestTime,
            message: "Backend connectivity successful",
          };
        }),
        catchError((error) => {
          const requestTime = performance.now() - requestStart;

          return throwError(() => ({
            success: false,
            status: error.status || 0,
            responseTime: requestTime,
            message: `Backend connectivity failed: ${error.message || "Unknown error"}`,
            error: error,
          }));
        }),
      );
  }

  /**
   * Test authentication endpoint
   * @returns Observable with auth test result
   */
  testAuthentication(): Observable<any> {
    const testUrl = `${this.apiUrl}/stats`; // Use stats endpoint as auth test

    const requestStart = performance.now();

    return this.http.get(testUrl, { observe: "response" }).pipe(
      map((response) => {
        const requestTime = performance.now() - requestStart;

        return {
          success: true,
          status: response.status,
          responseTime: requestTime,
          message: "Authentication successful",
        };
      }),
      catchError((error) => {
        const requestTime = performance.now() - requestStart;

        return throwError(() => ({
          success: false,
          status: error.status || 0,
          responseTime: requestTime,
          message: `Authentication failed: ${error.message || "Unknown error"}`,
          error: error,
        }));
      }),
    );
  }

  /**
   * Generate filename for export
   * @param format - Export format
   * @param filters - Applied filters
   * @returns Generated filename
   */
  generateExportFilename(format: string, filters: AccessFilters): string {
    const date = new Date().toISOString().split("T")[0];
    const extension = format === "excel" ? "xlsx" : "csv";

    let filename = `historial-accesos-${date}`;

    if (filters.startDate && filters.endDate) {
      filename += `_${filters.startDate}_${filters.endDate}`;
    }

    if (filters.clientName) {
      filename += `_${filters.clientName.replace(/\s+/g, "-")}`;
    }

    return `${filename}.${extension}`;
  }

  /**
   * Format date for API requests
   * @param date - Date to format
   * @returns Formatted date string (YYYY-MM-DD)
   */
  formatDateForApi(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  /**
   * Ensure date is in YYYY-MM-DD format
   * @param dateInput - Date string or Date object
   * @returns Formatted date string (YYYY-MM-DD)
   */
  private ensureDateFormat(dateInput: string | Date): string {
    if (typeof dateInput === "string") {
      // If already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        return dateInput;
      }
      // Otherwise convert string to date and format
      const date = new Date(dateInput);
      return this.formatDateForApi(date);
    }
    // If it's a Date object, format it
    return this.formatDateForApi(dateInput);
  }

  /**
   * Normalize successful field to ensure consistent boolean values
   * @param successful - Value from backend (could be boolean, string, or number)
   * @returns Normalized boolean value
   */
  private normalizeSuccessfulField(successful: any): boolean {
    if (successful === null || successful === undefined) {
      return false;
    }

    if (typeof successful === "boolean") {
      return successful;
    }

    if (typeof successful === "string") {
      return successful.toLowerCase() === "true" || successful === "1";
    }

    if (typeof successful === "number") {
      return successful === 1;
    }

    // Default to boolean conversion
    return Boolean(successful);
  }

  /**
   * Get date range for common periods
   * @param period - Period type
   * @returns Object with start and end dates
   */
  getDateRangeForPeriod(period: "today" | "week" | "month" | "year"): {
    startDate: string;
    endDate: string;
  } {
    const today = new Date();
    const endDate = this.formatDateForApi(today);
    let startDate: string;

    switch (period) {
      case "today":
        startDate = endDate;
        break;
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        startDate = this.formatDateForApi(weekAgo);
        break;
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        startDate = this.formatDateForApi(monthAgo);
        break;
      case "year":
        const yearAgo = new Date(today);
        yearAgo.setFullYear(today.getFullYear() - 1);
        startDate = this.formatDateForApi(yearAgo);
        break;
      default:
        startDate = endDate;
    }

    return { startDate, endDate };
  }

  /**
   * Handle HTTP errors
   * @param error - HTTP error response
   * @returns Observable error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = "Error desconocido del sistema";

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = "Error de conexión. Verifique su conexión a internet.";
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage =
            error.error?.message || "Datos inválidos. Verifique los filtros aplicados.";
          break;
        case 401:
          errorMessage = "No autorizado. Inicie sesión nuevamente.";
          break;
        case 403:
          errorMessage =
            error.error?.message || "No tiene permisos para acceder a esta información.";
          break;
        case 404:
          errorMessage = error.error?.message || "Información no encontrada.";
          break;
        case 500:
          errorMessage = error.error?.message || "Error interno del servidor. Intente nuevamente.";
          break;
        case 0:
          errorMessage = "No se pudo conectar al servidor. Verifique la conexión.";
          break;
        default:
          errorMessage =
            error.error?.message ||
            error.error?.data?.message ||
            "Error del servidor. Intente nuevamente.";
      }
    }

    console.error("GymAccessAdminService Error:", error);
    return throwError(() => new Error(errorMessage));
  }
}
