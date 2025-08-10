import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { Router } from "@angular/router";
import { GymAccessService } from "../../services/gym-access.service";
import { GymAccessResponse, GymAccessFormState } from "../../interfaces/special-access.interface";
import { LoadingOverlayService } from "@core/services/loading-overlay.service";
import { SnackBarService } from "@core/services/snackbar.service";

@Component({
  selector: "app-special-access-page",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: "./special-access-page.component.html",
  styleUrl: "./special-access-page.component.css",
})
export class SpecialAccessPageComponent implements OnInit, OnDestroy {
  currentTime: string = "";
  private timeInterval?: NodeJS.Timeout;
  private resetTimeout?: NodeJS.Timeout;

  // Gym Access Form State
  formState: GymAccessFormState = {
    cedula: "",
    isValid: false,
    isLoading: false,
    showResult: false,
  };

  // Virtual Keypad
  keypadNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  showKeypad = true;

  constructor(
    private router: Router,
    private gymAccessService: GymAccessService,
    private loadingService: LoadingOverlayService,
    private snackbarService: SnackBarService,
  ) {}

  ngOnInit(): void {
    this.updateTime();
    // Update time every second
    this.timeInterval = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  ngOnDestroy(): void {
    // Clean up intervals to prevent memory leaks
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
  }

  private updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  goToDashboard(): void {
    this.router.navigate(["/"]);
  }

  goToClients(): void {
    this.router.navigate(["/clientes"]);
  }

  goToRoutines(): void {
    this.router.navigate(["/rutinas"]);
  }

  // Gym Access Methods
  onCedulaChange(): void {
    // Remove any non-numeric characters
    this.formState.cedula = this.formState.cedula.replace(/\D/g, "");

    // Limit to 8 digits
    if (this.formState.cedula.length > 8) {
      this.formState.cedula = this.formState.cedula.substring(0, 8);
    }

    // Validate cedula
    this.formState.isValid = this.gymAccessService.isValidCedula(this.formState.cedula);

    // Reset form state if cedula is being modified
    if (this.formState.showResult) {
      this.resetForm();
    }
  }

  onKeypadClick(number: string): void {
    if (this.formState.cedula.length < 8 && !this.formState.isLoading) {
      this.formState.cedula += number;
      this.onCedulaChange();
    }
  }

  onBackspace(): void {
    if (this.formState.cedula.length > 0 && !this.formState.isLoading) {
      this.formState.cedula = this.formState.cedula.slice(0, -1);
      this.onCedulaChange();
    }
  }

  onClear(): void {
    if (!this.formState.isLoading) {
      this.resetForm();
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.formState.isValid || this.formState.isLoading) {
      return;
    }

    this.formState.isLoading = true;
    this.loadingService.show();

    try {
      const response = await this.gymAccessService
        .validateAccess(this.formState.cedula)
        .toPromise();
      console.log("Response received:", response); // Debug log
      this.formState.response = response;
      this.formState.showResult = true;

      // Play success/error sound (if available)
      if (response) {
        this.playAccessSound(response.success);

        // Show snackbar with result
        if (response.success) {
          this.snackbarService.showSuccess("Acceso autorizado", response.message);
        } else {
          this.snackbarService.showError("Acceso denegado", response.message);
        }
      }

      // Auto-reset after successful access or error
      this.scheduleAutoReset();
    } catch (error: unknown) {
      // Handle service errors
      const errorResponse = error as GymAccessResponse;
      this.formState.response = errorResponse;
      this.formState.showResult = true;

      this.playAccessSound(false);
      this.snackbarService.showError(
        "Error de acceso",
        errorResponse.reason || "Error de conexión",
      );

      this.scheduleAutoReset();
    } finally {
      this.formState.isLoading = false;
      this.loadingService.hide();
    }
  }

  resetForm(): void {
    this.formState = {
      cedula: "",
      isValid: false,
      isLoading: false,
      showResult: false,
    };

    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
  }

  private scheduleAutoReset(): void {
    // Auto-reset after 5 seconds for next client
    this.resetTimeout = setTimeout(() => {
      this.resetForm();
    }, 5000);
  }

  private playAccessSound(success: boolean): void {
    // Optional: Play different sounds for success/error
    // This could be implemented with Web Audio API or audio elements
    try {
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(
          success ? "Acceso autorizado" : "Acceso denegado",
        );
        utterance.lang = "es-ES";
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      // Ignore speech synthesis errors
      console.log("Speech synthesis not available");
    }
  }

  // Utility methods for template
  get formattedCedula(): string {
    return this.gymAccessService.formatCedula(this.formState.cedula);
  }

  get isSuccessResult(): boolean {
    return this.formState.response?.success === true;
  }

  get isErrorResult(): boolean {
    return this.formState.response?.success === false;
  }

  get hasReward(): boolean {
    return Boolean(this.formState.response?.reward);
  }
}
