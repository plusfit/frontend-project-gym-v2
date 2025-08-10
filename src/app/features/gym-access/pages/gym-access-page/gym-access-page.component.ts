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
import { TitleComponent } from "@shared/components/title/title.component";
import { AuthState } from "@features/auth/state/auth.state";
import { environment } from "../../../../../environments/environment";

import { AccessHistoryTableComponent } from "../../components/access-history-table/access-history-table.component";
import { GymAccessAdminService } from "../../services/gym-access-admin.service";
import {
  GymAccessHistoryItem,
  AccessFilters,
  GymAccessHistoryResponse,
} from "../../interfaces/gym-access-admin.interface";

@Component({
  selector: "app-gym-access-page",
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    TitleComponent,
    AccessHistoryTableComponent,
  ],
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

  // Current filters
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
    console.log("=== GYM ACCESS PAGE INITIALIZATION ===");
    console.log("Component initialized at:", new Date().toISOString());

    // Comprehensive authentication debugging
    const authState = this.store.selectSnapshot((state) => state.auth);
    const isAuthenticated = this.store.selectSnapshot(AuthState.isAuthenticated);
    const accessToken = this.store.selectSnapshot(AuthState.accessToken);
    const refreshToken = this.store.selectSnapshot(AuthState.refreshToken);
    const userId = this.store.selectSnapshot(AuthState.userId);
    const userData = this.store.selectSnapshot(AuthState.userData);

    console.log("=== AUTHENTICATION DEBUG ===");
    console.log("Full auth state:", JSON.stringify(authState, null, 2));
    console.log("Is authenticated:", isAuthenticated);
    console.log("Has access token:", !!accessToken);
    console.log("Has refresh token:", !!refreshToken);
    console.log("User ID:", userId);
    console.log("User data:", userData);

    if (accessToken) {
      console.log(
        "Access token preview:",
        `${accessToken.substring(0, 15)}...${accessToken.substring(accessToken.length - 10)}`,
      );
      console.log("Access token length:", accessToken.length);

      // JWT token validation
      try {
        const tokenParts = accessToken.split(".");
        console.log("JWT parts count:", tokenParts.length);

        if (tokenParts.length === 3) {
          // Decode JWT payload (without verification)
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log("JWT payload:", payload);
          console.log("Token expiration:", new Date(payload.exp * 1000).toISOString());
          console.log("Token is expired:", Date.now() > payload.exp * 1000);
        } else {
          console.error("Invalid JWT format - expected 3 parts, got:", tokenParts.length);
        }
      } catch (error) {
        console.error("Error parsing JWT token:", error);
      }
    } else {
      console.warn("No access token available");
    }

    // Check local storage for session persistence
    console.log("=== SESSION STORAGE DEBUG ===");
    console.log("SessionStorage auth:", sessionStorage.getItem("auth"));
    console.log("LocalStorage auth:", localStorage.getItem("auth"));

    if (!isAuthenticated) {
      console.warn("=== AUTHENTICATION FAILED ===");
      console.warn(
        "User is not authenticated - loading with mock data or allowing unauthenticated calls",
      );
      // Instead of redirecting, we'll try to load data anyway or use mock data
      console.log("=== PROCEEDING WITH DATA LOADING (UNAUTHENTICATED) ===");
      // Load mock data as fallback
      this.loadMockData();
      // Also try to load real data (backend might allow unauthenticated access)
      this.loadAccessHistory();
      return;
    }

    console.log("=== PROCEEDING WITH DATA LOADING (AUTHENTICATED) ===");
    this.loadAccessHistory();
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

    console.log("=== LOADING ACCESS HISTORY ===");
    console.log("Current filters:", JSON.stringify(this.filters, null, 2));
    console.log("Loading state set to true at:", new Date().toISOString());

    // Pre-request authentication check
    const isStillAuthenticated = this.store.selectSnapshot(AuthState.isAuthenticated);
    const currentToken = this.store.selectSnapshot(AuthState.accessToken);

    console.log("Pre-request auth check:", {
      isAuthenticated: isStillAuthenticated,
      hasToken: !!currentToken,
    });

    if (!isStillAuthenticated || !currentToken) {
      console.warn("No authentication available - proceeding with unauthenticated request");
      console.log("This may result in 401 error, but we'll try anyway");
      // Don't return here - continue with the request
    }

    this.gymAccessAdminService
      .getAccessHistory(this.filters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          console.log("Loading finished. Current state:", {
            accessHistory: this.accessHistory,
            totalCount: this.totalCount,
            loading: this.loading,
          });
        }),
      )
      .subscribe({
        next: (response: GymAccessHistoryResponse) => {
          console.log("=== ACCESS HISTORY SUCCESS ===");
          console.log("Raw response received:", JSON.stringify(response, null, 2));
          console.log("Response type:", typeof response);
          console.log("Response constructor:", response?.constructor?.name);

          // Debug: Log the raw response and inspect data types
          if (response && response.history && response.history.length > 0) {
            console.log(
              "Sample record from response:",
              JSON.stringify(response.history[0], null, 2),
            );
            console.log("Successful field details:", {
              value: response.history[0].successful,
              type: typeof response.history[0].successful,
              isBoolean:
                response.history[0].successful === true || response.history[0].successful === false,
              isString: typeof response.history[0].successful === "string",
              stringValue: String(response.history[0].successful),
            });
          }

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

            console.log("Data processed successfully:", {
              historyCount: this.accessHistory.length,
              totalCount: this.totalCount,
              currentPage: this.currentPage,
            });

            if (this.accessHistory.length === 0 && this.totalCount === 0) {
              console.log("No access history data found");
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
          console.error("=== ACCESS HISTORY ERROR ===");
          console.error("Error object:", error);
          console.error("Error type:", typeof error);
          console.error("Error constructor:", error?.constructor?.name);
          console.error("Error stack:", error?.stack);

          // Check if authentication is still valid after error
          const authAfterError = {
            isAuthenticated: this.store.selectSnapshot(AuthState.isAuthenticated),
            hasToken: !!this.store.selectSnapshot(AuthState.accessToken),
          };
          console.error("Auth status after error:", authAfterError);

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
            errorMessage =
              "No se pudo conectar al servidor. Verifique que el backend esté ejecutándose en: " +
              environment.api;
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

          console.error("Final error message:", errorMessage);

          // Set error state
          this.hasError = true;
          this.errorMessage = errorMessage;

          // Handle authentication errors
          if (shouldRedirectToLogin) {
            console.log("Redirecting to login due to auth error");
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
   * Handle filter changes from the table component
   */
  onFiltersChange(newFilters: AccessFilters): void {
    this.filters = { ...newFilters };
    this.loadAccessHistory();
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
   * Handle export data requests
   */
  onExportData(format: string): void {
    this.loadingOverlayService.show();

    const exportOptions = {
      format: format as "csv" | "excel",
      filters: this.filters,
      includeStats: true,
    };

    this.gymAccessAdminService
      .exportAccessHistory(exportOptions)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingOverlayService.hide()),
      )
      .subscribe({
        next: (blob: Blob) => {
          const filename = this.gymAccessAdminService.generateExportFilename(format, this.filters);
          this.gymAccessAdminService.downloadFile(blob, filename);
          this.showSuccess(`Archivo ${format.toUpperCase()} descargado exitosamente`);
        },
        error: (error) => {
          console.error("Error exporting data:", error);
          this.showError("Error al exportar los datos");
        },
      });
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
    console.log("=== REFRESHING DATA ===");
    this.hasError = false;
    this.errorMessage = "";
    this.loadAccessHistory();
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
   * Get page title
   */
  getPageTitle(): string {
    return "Historial de Accesos al Gimnasio";
  }

  /**
   * Get page subtitle
   */
  getPageSubtitle(): string {
    return "Gestión y seguimiento de accesos de clientes";
  }

  /**
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
   * Load mock data for testing purposes
   */
  loadMockData(): void {
    console.log("Loading mock data for testing...");

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

    console.log("Mock data loaded successfully");
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
    console.log("=== TESTING BACKEND CONNECTIVITY ===");

    this.gymAccessAdminService.testConnectivity().subscribe({
      next: (result) => {
        console.log("Connectivity test result:", result);
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
    console.log("=== TESTING AUTHENTICATION ===");

    this.gymAccessAdminService.testAuthentication().subscribe({
      next: (result) => {
        console.log("Authentication test result:", result);
        this.showSuccess(`Autenticación exitosa: ${result.responseTime.toFixed(2)}ms`);
      },
      error: (error) => {
        console.error("Authentication test failed:", error);
        this.showError(`Fallo de autenticación: ${error.message}`);
      },
    });
  }

  /**
   * Run comprehensive diagnostics
   */
  runDiagnostics(): void {
    console.log("=== RUNNING COMPREHENSIVE DIAGNOSTICS ===");

    const diagnosticResults: any[] = [];

    // 1. Check environment configuration
    console.log("1. Environment Configuration:");
    console.log("  - API URL:", environment.api);
    console.log("  - Production mode:", environment.production);

    // 2. Check authentication state
    console.log("2. Authentication State:");
    const authState = this.getAuthStatus();
    console.log("  - Auth state:", authState);

    // 3. Test connectivity
    console.log("3. Testing Backend Connectivity...");
    this.testBackendConnectivity();

    // 4. Test authentication if authenticated
    if (authState.isAuthenticated) {
      console.log("4. Testing Authentication...");
      this.testAuthentication();
    } else {
      console.log("4. Skipping authentication test - not authenticated");
    }

    // 5. Test actual data loading
    console.log("5. Testing Data Loading...");
    this.loadAccessHistory();

    this.showSuccess("Diagnósticos ejecutados - revise la consola para detalles");
  }
}
