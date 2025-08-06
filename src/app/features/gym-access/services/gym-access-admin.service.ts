import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, tap, map } from "rxjs/operators";
import { environment } from "../../../../environments/environment";
import {
  GymAccessHistoryResponse,
  WrappedGymAccessHistoryResponse,
  GymAccessStatsResponse,
  DirectGymAccessStatsResponse,
  ClientAccessHistoryResponse,
  AccessFilters,
  StatsPeriod,
  ExportOptions,
} from "../interfaces/gym-access-admin.interface";

@Injectable({
  providedIn: "root",
})
export class GymAccessAdminService {
  private readonly apiUrl = `${environment.api}/gym-access`;

  constructor(private http: HttpClient) {
    console.log("GymAccessAdminService initialized with API URL:", this.apiUrl);
    console.log("Environment API URL:", environment.api);
  }

  /**
   * Get paginated gym access history with filters
   * @param filters - Filters to apply to the search
   * @returns Observable with access history response
   */
  getAccessHistory(filters: AccessFilters): Observable<GymAccessHistoryResponse> {
    let params = new HttpParams()
      .set("page", filters.page.toString())
      .set("limit", filters.limit.toString());

    if (filters.startDate) {
      params = params.set("startDate", filters.startDate);
    }

    if (filters.endDate) {
      params = params.set("endDate", filters.endDate);
    }

    if (filters.clientName) {
      params = params.set("clientName", filters.clientName);
    }

    if (filters.successful !== undefined) {
      params = params.set("successful", filters.successful.toString());
    }

    if (filters.cedula) {
      params = params.set("cedula", filters.cedula);
    }

    const url = `${this.apiUrl}/history`;
    console.log("=== ACCESS HISTORY REQUEST DEBUG ===");
    console.log("Full URL:", url);
    console.log("Query params:", params.toString());
    console.log("Request filters:", JSON.stringify(filters, null, 2));
    console.log("Environment config:", {
      api: environment.api,
      production: environment.production,
    });

    const requestStart = performance.now();

    return this.http
      .get<GymAccessHistoryResponse | WrappedGymAccessHistoryResponse>(url, { params })
      .pipe(
        map((response) => {
          console.log("=== RAW BACKEND RESPONSE ===");
          console.log("Full raw response:", JSON.stringify(response, null, 2));

          // Handle wrapped response format
          if ((response as any).success !== undefined && (response as any).data) {
            console.log("Detected wrapped response format");
            return (response as WrappedGymAccessHistoryResponse).data;
          }

          // Handle direct response format
          if ((response as any).history && (response as any).pagination) {
            console.log("Detected direct response format");
            return response as GymAccessHistoryResponse;
          }

          // Handle unexpected format
          console.warn("Unexpected response format:", response);
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
        tap((response) => {
          const requestTime = performance.now() - requestStart;
          console.log("=== ACCESS HISTORY RESPONSE SUCCESS ===");
          console.log("Request time:", `${requestTime.toFixed(2)}ms`);
          console.log("Processed response structure:", {
            hasHistory: !!response?.history,
            historyLength: response?.history?.length || 0,
            hasPagination: !!response?.pagination,
            totalCount: response?.pagination?.totalCount || 0,
          });
          console.log("Processed response:", JSON.stringify(response, null, 2));
        }),
        catchError((error) => {
          const requestTime = performance.now() - requestStart;
          console.error("=== ACCESS HISTORY REQUEST FAILED ===");
          console.error("Request time:", `${requestTime.toFixed(2)}ms`);
          console.error("Error status:", error.status);
          console.error("Error statusText:", error.statusText);
          console.error("Error URL:", error.url);
          console.error("Error headers:", error.headers?.keys());
          console.error("Error body:", error.error);
          console.error("Full error object:", error);

          // Additional network diagnostics
          if (error.status === 0) {
            console.error("Network Error Details:");
            console.error("- This usually indicates a CORS issue or network connectivity problem");
            console.error("- Check if the backend server is running on:", environment.api);
            console.error("- Verify CORS configuration on the backend");
          }

          return this.handleError(error);
        }),
      );
  }

  /**
   * Get gym access statistics for the specified period
   * @param period - The time period and date range for statistics
   * @returns Observable with statistics response
   */
  getAccessStats(period?: StatsPeriod): Observable<GymAccessStatsResponse> {
    let params = new HttpParams();

    if (period) {
      if (period.startDate) {
        params = params.set("startDate", period.startDate);
      }
      if (period.endDate) {
        params = params.set("endDate", period.endDate);
      }
      if (period.period) {
        params = params.set("period", period.period);
      }
    }

    return this.http
      .get<GymAccessStatsResponse>(`${this.apiUrl}/stats`, { params })
      .pipe(catchError((error) => this.handleError(error)));
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
   * Export access history data
   * @param options - Export options including format and filters
   * @returns Observable with blob data for download
   */
  exportAccessHistory(options: ExportOptions): Observable<Blob> {
    let params = new HttpParams()
      .set("format", options.format)
      .set("page", options.filters.page.toString())
      .set("limit", options.filters.limit.toString());

    if (options.filters.startDate) {
      params = params.set("startDate", options.filters.startDate);
    }

    if (options.filters.endDate) {
      params = params.set("endDate", options.filters.endDate);
    }

    if (options.filters.clientName) {
      params = params.set("clientName", options.filters.clientName);
    }

    if (options.filters.successful !== undefined) {
      params = params.set("successful", options.filters.successful.toString());
    }

    if (options.filters.cedula) {
      params = params.set("cedula", options.filters.cedula);
    }

    if (options.includeStats) {
      params = params.set("includeStats", "true");
    }

    return this.http
      .get(`${this.apiUrl}/export`, {
        params,
        responseType: "blob",
      })
      .pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Get today's access summary
   * @returns Observable with today's statistics
   */
  getTodaysStats(): Observable<GymAccessStatsResponse> {
    const url = `${this.apiUrl}/stats`;
    console.log("=== STATS REQUEST DEBUG ===");
    console.log("Stats URL:", url);

    const requestStart = performance.now();

    return this.http.get<GymAccessStatsResponse | DirectGymAccessStatsResponse>(url).pipe(
      map((response) => {
        console.log("=== RAW STATS RESPONSE ===");
        console.log("Raw stats response:", JSON.stringify(response, null, 2));

        // Handle wrapped response format with success field
        if ((response as any).success !== undefined && (response as any).data) {
          console.log("Detected wrapped stats response format");
          return response as GymAccessStatsResponse;
        }

        // Handle direct stats response format
        if ((response as any).overview || (response as any).dailyStats) {
          console.log("Detected direct stats response format - wrapping in success object");
          return {
            success: true,
            data: response as DirectGymAccessStatsResponse,
            message: "Stats loaded successfully",
          } as GymAccessStatsResponse;
        }

        // Handle unexpected format
        console.warn("Unexpected stats response format:", response);
        return {
          success: false,
          data: {
            overview: {
              totalAccessesToday: 0,
              totalAccessesThisWeek: 0,
              totalAccessesThisMonth: 0,
              uniqueClientsToday: 0,
              uniqueClientsThisMonth: 0,
              averageSuccessRate: 0,
              peakHour: 0,
            },
            dailyStats: [],
            weeklyStats: [],
            monthlyStats: [],
            topClients: [],
            popularTimes: [],
            rewardStats: {
              totalRewardsEarned: 0,
              activeRewards: 0,
              rewardsByType: [],
              topRewardEarners: [],
            },
          },
          message: "No stats data available",
        } as GymAccessStatsResponse;
      }),
      tap((response) => {
        const requestTime = performance.now() - requestStart;
        console.log("=== STATS RESPONSE SUCCESS ===");
        console.log("Request time:", `${requestTime.toFixed(2)}ms`);
        console.log("Processed stats response:", JSON.stringify(response, null, 2));
      }),
      catchError((error) => {
        const requestTime = performance.now() - requestStart;
        console.error("=== STATS REQUEST FAILED ===");
        console.error("Request time:", `${requestTime.toFixed(2)}ms`);
        console.error("Stats error:", error);
        return this.handleError(error);
      }),
    );
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
    console.log("=== CONNECTIVITY TEST ===");
    console.log("Testing connectivity to:", testUrl);

    const requestStart = performance.now();

    return this.http
      .get(testUrl, {
        headers: { "Content-Type": "application/json" },
        observe: "response",
      })
      .pipe(
        map((response) => {
          const requestTime = performance.now() - requestStart;
          console.log("=== CONNECTIVITY TEST SUCCESS ===");
          console.log("Response time:", `${requestTime.toFixed(2)}ms`);
          console.log("Status:", response.status);
          console.log("Headers:", response.headers.keys());
          console.log("Body:", response.body);

          return {
            success: true,
            status: response.status,
            responseTime: requestTime,
            message: "Backend connectivity successful",
          };
        }),
        catchError((error) => {
          const requestTime = performance.now() - requestStart;
          console.error("=== CONNECTIVITY TEST FAILED ===");
          console.error("Response time:", `${requestTime.toFixed(2)}ms`);
          console.error("Error:", error);

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
    console.log("=== AUTHENTICATION TEST ===");
    console.log("Testing auth with:", testUrl);

    const requestStart = performance.now();

    return this.http.get(testUrl, { observe: "response" }).pipe(
      map((response) => {
        const requestTime = performance.now() - requestStart;
        console.log("=== AUTHENTICATION TEST SUCCESS ===");
        console.log("Response time:", `${requestTime.toFixed(2)}ms`);
        console.log("Status:", response.status);

        return {
          success: true,
          status: response.status,
          responseTime: requestTime,
          message: "Authentication successful",
        };
      }),
      catchError((error) => {
        const requestTime = performance.now() - requestStart;
        console.error("=== AUTHENTICATION TEST FAILED ===");
        console.error("Response time:", `${requestTime.toFixed(2)}ms`);
        console.error("Error:", error);

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
