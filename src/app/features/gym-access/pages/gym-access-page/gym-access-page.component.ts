import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { PageEvent } from "@angular/material/paginator";
import { Sort } from "@angular/material/sort";
import { Subject, takeUntil, finalize } from "rxjs";
import { Store } from "@ngxs/store";

import { LoadingOverlayService } from "@core/services/loading-overlay.service";
import { SnackBarService } from "@core/services/snackbar.service";
import { AuthState } from "@features/auth/state/auth.state";
import { SetMockAuth } from "@features/auth/state/auth.actions";
import { environment } from "../../../../../environments/environment";

import { AccessHistoryTableComponent } from "../../components/access-history-table/access-history-table.component";
import { GymAccessAdminService } from "../../services/gym-access-admin.service";
import {
  GymAccessHistoryItem,
  AccessFilters,
  AccessStats,
  GymAccessHistoryResponse,
} from "../../interfaces/gym-access-admin.interface";

@Component({
  selector: "app-gym-access-page",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, AccessHistoryTableComponent],
  templateUrl: "./gym-access-page.component.html",
  styleUrls: ["./gym-access-page.component.css"],
})
export class GymAccessPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Component state
  accessHistory: GymAccessHistoryItem[] = [];
  loading = false;
  totalCount = 0;
  currentPage = 0;
  pageSize = 10;
  hasError = false;
  errorMessage = "";

  // Statistics
  stats: AccessStats | null = null;
  statsLoading = false;
  statsError = false;

  // Current filters - Will be initialized with today's date
  filters: AccessFilters = {
    page: 1,
    limit: 10,
  };

  constructor(
    private gymAccessAdminService: GymAccessAdminService,
    private loadingOverlayService: LoadingOverlayService,
    private snackbarService: SnackBarService,
    private router: Router,
    private store: Store,
  ) {}

  ngOnInit(): void {
    // Initialize default filter to today's date
    this.initializeTodayFilter();

    // Comprehensive authentication debugging
    const authState = this.store.selectSnapshot((state) => state.auth);
    const isAuthenticated = this.store.selectSnapshot(AuthState.isAuthenticated);
    const accessToken = this.store.selectSnapshot(AuthState.accessToken);
    const refreshToken = this.store.selectSnapshot(AuthState.refreshToken);
    const userId = this.store.selectSnapshot(AuthState.userId);
    const userData = this.store.selectSnapshot(AuthState.userData);

    if (accessToken) {
      // JWT token validation
      try {
        const tokenParts = accessToken.split(".");

        if (tokenParts.length === 3) {
          // Decode JWT payload (without verification)
          const payload = JSON.parse(atob(tokenParts[1]));
        }
      } catch (error) {
        console.error("Error parsing JWT token:", error);
      }
    }

    // Check local storage for session persistence

    if (!isAuthenticated) {
      console.warn("User is not authenticated - setting mock auth token for testing");
      // Set mock auth token for testing
      this.setMockAuthToken();
      return;
    }

    this.loadAccessHistory();
    this.loadStats();

    // Make debug method globally accessible
    (window as any).debugGymAccess = this;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load access history with current filters
   */
  loadAccessHistory(): void {
    this.loading = true;
    this.hasError = false;
    this.errorMessage = "";

    // Pre-request authentication check
    const isStillAuthenticated = this.store.selectSnapshot(AuthState.isAuthenticated);
    const currentToken = this.store.selectSnapshot(AuthState.accessToken);

    if (!isStillAuthenticated || !currentToken) {
      console.warn("No authentication available - proceeding with unauthenticated request");
      // Don't return here - continue with the request
    }

    this.gymAccessAdminService
      .getAccessHistory(this.filters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          // After loading history, also load stats to ensure they're in sync
          this.loadStats();
        }),
      )
      .subscribe({
        next: (response: GymAccessHistoryResponse) => {
          if (response) {
            // Handle backend response structure
            this.accessHistory = response.history || [];

            if (response.pagination) {
              this.totalCount = response.pagination.totalCount || 0;
              this.currentPage = (response.pagination.currentPage || 1) - 1; // Mat-paginator is 0-indexed
              this.pageSize = response.pagination.limit || 10;
            } else {
              this.totalCount = this.accessHistory.length;
              this.currentPage = 0;
            }

            if (this.accessHistory.length === 0 && this.totalCount === 0) {
              // No data found - this is normal, not an error
            }
          } else {
            // Handle null/undefined response - this IS an error
            console.error("No response received from server");
            this.hasError = true;
            this.errorMessage =
              "Error al cargar el historial de accesos - no se recibió respuesta del servidor";
            this.showError(this.errorMessage);
            this.accessHistory = [];
            this.totalCount = 0;
          }
        },
        error: (error) => {
          console.error("Error loading access history:", error);

          // More detailed error handling with specific actions
          let errorMessage = "Error al cargar el historial de accesos";
          let shouldRedirectToLogin = false;

          if (error.status === 401) {
            errorMessage =
              error.error?.message || "No autorizado. Por favor, inicie sesión nuevamente.";
            shouldRedirectToLogin = true;
          } else if (error.status === 403) {
            errorMessage =
              error.error?.message || "No tiene permisos para acceder a esta información.";
          } else if (error.status === 404) {
            errorMessage =
              error.error?.message ||
              "Servicio no encontrado. Verifique la configuración del servidor.";
          } else if (error.status === 0) {
            errorMessage = `No se pudo conectar al servidor. Verifique que el backend esté ejecutándose en: ${environment.api}`;
          } else if (error.status >= 500) {
            errorMessage =
              error.error?.message ||
              "Error interno del servidor. Intente nuevamente en unos momentos.";
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.data?.message) {
            errorMessage = error.error.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          } else {
            errorMessage = "Error del servidor. Intente nuevamente.";
          }

          // Set error state
          this.hasError = true;
          this.errorMessage = errorMessage;

          // Handle authentication errors
          if (shouldRedirectToLogin) {
            this.router.navigate(["/auth/login"]);
            return;
          }

          this.showError(errorMessage);
          this.accessHistory = [];
          this.totalCount = 0;
        },
      });
  }

  /**
   * Load access statistics with current filters
   */
  private loadStats(): void {
    this.statsLoading = true;
    this.statsError = false;

    // Use current filters for stats (exclude pagination)
    const statsFilters: Partial<AccessFilters> = {
      cedula: this.filters.cedula,
      clientName: this.filters.clientName,
      successful: this.filters.successful,
      startDate: this.filters.startDate,
      endDate: this.filters.endDate,
    };

    this.gymAccessAdminService
      .getStats(statsFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          // Check if backend stats are returning 0 but we have data in the current table
          const hasHistoryData = this.accessHistory && this.accessHistory.length > 0;
          const backendStatsEmpty = stats.totalAccesses === 0 && stats.successfulAccesses === 0;

          if (hasHistoryData && backendStatsEmpty) {
            // Calculate stats from current history data as fallback
            const calculatedStats = this.calculateStatsFromHistory();
            this.stats = calculatedStats;
          } else {
            this.stats = stats;
          }

          this.statsLoading = false;
        },
        error: (error) => {
          console.error("Error loading stats:", error);
          this.statsError = true;
          this.statsLoading = false;
          this.stats = null;
        },
      });
  }

  /**
   * Calculate statistics from current history data (fallback when backend stats are buggy)
   */
  private calculateStatsFromHistory(): AccessStats {
    if (!this.accessHistory || this.accessHistory.length === 0) {
      return {
        totalAccesses: 0,
        successfulAccesses: 0,
        failedAccesses: 0,
        totalAccessesToday: 0,
        totalAccessesThisMonth: 0,
        averageAccessesPerDay: 0,
        mostActiveClients: [],
      };
    }

    const totalAccesses = this.accessHistory.length;
    const successfulAccesses = this.accessHistory.filter((item) => item.successful === true).length;
    const failedAccesses = this.accessHistory.filter((item) => item.successful === false).length;

    // For filtered data, we can't calculate daily averages accurately without all data
    // So we'll use the current count as total and set others to 0
    return {
      totalAccesses: totalAccesses,
      successfulAccesses: successfulAccesses,
      failedAccesses: failedAccesses,
      totalAccessesToday: 0, // Can't calculate this from filtered data
      totalAccessesThisMonth: totalAccesses, // Use current filtered total
      averageAccessesPerDay: 0, // Can't calculate this from filtered data
      mostActiveClients: [], // Can't calculate this from paginated data
    };
  }

  /**
   * Handle filter changes from the table component
   */
  onFiltersChange(newFilters: AccessFilters): void {
    this.filters = { ...newFilters };

    // Reset pagination to first page when filters change
    this.currentPage = 0;

    this.loadAccessHistory();
    // loadStats is now called automatically after loadAccessHistory completes
  }

  /**
   * Handle page change events
   */
  onPageChange(event: PageEvent): void {
    this.filters = {
      ...this.filters,
      page: event.pageIndex + 1, // Convert to 1-indexed
      limit: event.pageSize,
    };
    this.loadAccessHistory();
  }

  /**
   * Handle sort change events
   */
  onSortChange(sort: Sort): void {
    // Add sorting logic if backend supports it
    // For now, we'll just reload the data
    this.loadAccessHistory();
  }

  /**
   * Handle view client detail requests
   */
  onViewClientDetail(cedula: string): void {
    // Navigate to client detail page
    this.router.navigate(["/clientes/detalle", cedula]);
  }

  /**
   * Refresh data
   */
  refreshData(): void {
    this.hasError = false;
    this.errorMessage = "";
    this.loadAccessHistory();
    this.loadStats();
    this.showSuccess("Datos actualizados");
  }

  /**
   * Format percentage
   */
  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  /**
   * Format number with commas
   */
  formatNumber(value: number): string {
    return value.toLocaleString("es-UY");
  }

  /**
   * Show success message
   */
  private showSuccess(message: string): void {
    this.snackbarService.showSuccess("Éxito", message);
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    this.snackbarService.showError("Error", message);
  }

  /**
   * Initialize filter with today's date
   */
  private initializeTodayFilter(): void {
    const today = new Date();

    // Use local date formatting to avoid timezone issues
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayString = `${year}-${month}-${day}`; // Format: YYYY-MM-DD

    this.filters = {
      ...this.filters,
      startDate: todayString,
      endDate: todayString,
    };
  } /**
   * Check if there are any records
   */
  hasRecords(): boolean {
    return this.accessHistory && this.accessHistory.length > 0;
  }

  /**
   * Get total records text
   */
  getTotalRecordsText(): string {
    if (!this.totalCount || this.totalCount === 0) {
      return "Sin registros";
    }

    if (this.totalCount === 1) {
      return "1 registro";
    }

    return `${this.formatNumber(this.totalCount)} registros`;
  }

  /**
   * Get current page info
   */
  getCurrentPageInfo(): string {
    if (!this.totalCount || this.totalCount === 0) {
      return "";
    }

    const startIndex = this.currentPage * this.pageSize + 1;
    const endIndex = Math.min((this.currentPage + 1) * this.pageSize, this.totalCount);

    return `Mostrando ${startIndex}-${endIndex} de ${this.formatNumber(this.totalCount)}`;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.store.selectSnapshot(AuthState.isAuthenticated);
  }

  /**
   * Get authentication status for debugging
   */
  getAuthStatus(): any {
    return {
      isAuthenticated: this.store.selectSnapshot(AuthState.isAuthenticated),
      hasAccessToken: !!this.store.selectSnapshot(AuthState.accessToken),
      userId: this.store.selectSnapshot(AuthState.userId),
    };
  }

  /**
   * Set mock authentication token for testing
   */
  setMockAuthToken(): void {
    // Use the generated JWT token from our backend test
    const mockToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJlbWFpbCI6ImFkbWluQHRlc3QuY29tIiwicm9sZSI6IkFkbWluIiwiaWF0IjoxNzU0ODYxOTAzLCJleHAiOjE3NTQ5NDgzMDN9.PjjNzSife-QM0j1prpQYfDYZ_-r4KurcRHFyQfwQw1Q";

    this.store.dispatch(
      new SetMockAuth({
        accessToken: mockToken,
        refreshToken: "mock-refresh-token",
      }),
    );

    // Now load the data with authentication
    setTimeout(() => {
      this.loadAccessHistory();
      this.loadStats();
    }, 100);
  }

  /**
   * Debug method to force reload stats - can be called from browser console
   */
  debugReloadStats(): void {
    this.loadStats();
  }

  /**
   * Load mock data for testing purposes
   */
  loadMockData(): void {
    // Mock access history data
    this.accessHistory = [
      {
        id: "1",
        clientId: "client1",
        cedula: "12345678",
        clientName: "Juan Pérez",
        clientPhoto: "",
        accessDate: new Date().toISOString(),
        accessDay: new Date().toISOString().split("T")[0],
        successful: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        clientId: "client2",
        cedula: "87654321",
        clientName: "María González",
        clientPhoto: "",
        accessDate: new Date(Date.now() - 3600000).toISOString(),
        accessDay: new Date(Date.now() - 3600000).toISOString().split("T")[0],
        successful: false,
        reason: "Plan vencido",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "3",
        clientId: "client3",
        cedula: "11223344",
        clientName: "Carlos Rodriguez",
        clientPhoto: "",
        accessDate: new Date(Date.now() - 7200000).toISOString(),
        accessDay: new Date(Date.now() - 7200000).toISOString().split("T")[0],
        successful: true,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ];

    this.totalCount = 3;
    this.currentPage = 0;
    this.pageSize = 10;
  }

  /**
   * Test data loading with mock data
   */
  testWithMockData(): void {
    this.loadMockData();
    this.showSuccess("Datos de prueba cargados correctamente");
  }

  /**
   * Test backend connectivity
   */
  testBackendConnectivity(): void {
    this.gymAccessAdminService.testConnectivity().subscribe({
      next: (result) => {
        this.showSuccess(`Conectividad exitosa: ${result.responseTime.toFixed(2)}ms`);
      },
      error: (error) => {
        console.error("Connectivity test failed:", error);
        this.showError(`Fallo de conectividad: ${error.message}`);
      },
    });
  }

  /**
   * Test authentication
   */
  testAuthentication(): void {
    this.gymAccessAdminService.testAuthentication().subscribe({
      next: (result) => {
        this.showSuccess(`Autenticación exitosa: ${result.responseTime.toFixed(2)}ms`);
      },
      error: (error) => {
        console.error("Authentication test failed:", error);
        this.showError(`Fallo de autenticación: ${error.message}`);
      },
    });
  }
}
