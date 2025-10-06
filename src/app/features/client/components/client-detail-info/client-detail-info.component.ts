import { AsyncPipe, DatePipe, JsonPipe } from "@angular/common";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { ClientsState } from "@features/client/state/clients.state";
import { GetUserPassword, ClearUserPassword, SendForgotPassword } from "@features/client/state/clients.actions";
import { Actions, Store, ofActionSuccessful } from "@ngxs/store";
import { Observable, Subject, takeUntil } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { LoaderComponent } from "../../../../shared/components/loader/loader.component";
import { TranslationPipe } from "@shared/pipes/translation.pipe";
import { BadgeComponent } from "@shared/components/badge/badge.component";
import { EColorBadge } from "@shared/enums/badge-color.enum";
import { ForgotPassword } from "@features/auth/state/auth.actions";
import { SnackBarService } from "@core/services/snackbar.service";

@Component({
  selector: "app-client-detail-info",
  standalone: true,
  imports: [
    AsyncPipe, 
    LoaderComponent,
    JsonPipe,
    DatePipe, 
    TranslationPipe, 
    BadgeComponent,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: "./client-detail-info.component.html",
  styleUrl: "./client-detail-info.component.css",
})
export class ClientDetailInfoComponent implements OnInit, OnDestroy {
  clientInfo$: Observable<any> | undefined;
  userPassword$: Observable<string | null> | undefined;
  passwordLoading$: Observable<boolean> | undefined;
  passwordError$: Observable<any> | undefined;
  forgotPasswordLoading$: Observable<boolean> | undefined;
  forgotPasswordSuccess$: Observable<boolean> | undefined;
  forgotPasswordError$: Observable<any> | undefined;
  adminCodeForm: FormGroup;
  showPasswordSection = false;
  passwordVisible = false;
  private destroy = new Subject<void>();

  constructor(
    private store: Store,
    private actions: Actions,
    private fb: FormBuilder,
    private snackBarService: SnackBarService,
  ) {
    this.adminCodeForm = this.fb.group({
      adminCode: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    this.clientInfo$ = this.store.select(ClientsState.getSelectedClient);
    this.userPassword$ = this.store.select(ClientsState.getUserPassword);
    this.passwordLoading$ = this.store.select(ClientsState.isPasswordLoading);
    this.passwordError$ = this.store.select(ClientsState.getPasswordError);
    this.forgotPasswordLoading$ = this.store.select(ClientsState.isForgotPasswordLoading);
    this.forgotPasswordSuccess$ = this.store.select(ClientsState.getForgotPasswordSuccess);
    this.forgotPasswordError$ = this.store.select(ClientsState.getForgotPasswordError);
  }

  /**
   * Toggle the password section visibility
   */
  togglePasswordSection(): void {
    this.showPasswordSection = !this.showPasswordSection;
    if (!this.showPasswordSection) {
      this.clearPassword();
    }
  }

  /**
   * Request user password with admin code
   */
  requestPassword(): void {
    if (this.adminCodeForm.valid) {
      const adminCode = this.adminCodeForm.get('adminCode')?.value;
      const clientInfo = this.store.selectSnapshot(ClientsState.getSelectedClient);
      
      if (clientInfo?._id) {
        this.store.dispatch(new GetUserPassword(clientInfo._id, adminCode));
      }
    }
  }

  /**
   * Clear the password from state
   */
  clearPassword(): void {
    this.store.dispatch(ClearUserPassword);
    this.adminCodeForm.reset();
    this.passwordVisible = false;
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  /**
   * Check if the admin code matches the environment code
   */
  isValidAdminCode(): boolean {
    const adminCode = this.adminCodeForm.get('adminCode')?.value;
    return adminCode === environment.adminPasswordCode;
  }

  /**
   * Send forgot password email to user
   */
  sendForgotPasswordEmail(): void {
    const clientInfo = this.store.selectSnapshot(ClientsState.getSelectedClient);

    if (clientInfo?.identifier) {
      this.store.dispatch(new ForgotPassword(clientInfo.identifier));
      
      // Escuchar cuando la acción sea exitosa y mostrar toast
      this.actions
        .pipe(ofActionSuccessful(ForgotPassword), takeUntil(this.destroy))
        .subscribe(() => {
          this.snackBarService.showSuccess(
            "Éxito", 
            "Se ha enviado el email de recuperación de contraseña correctamente"
          );
        });
    }
  }

  /**
   * Get badge color based on total accesses count
   */
  getTotalAccessesBadgeColor(totalAccesses: number): EColorBadge {
    if (!totalAccesses || totalAccesses === 0) {
      return EColorBadge.NEUTRAL;
    }
    if (totalAccesses <= 5) {
      return EColorBadge.WARNING;
    }
    if (totalAccesses <= 15) {
      return EColorBadge.INFO;
    }
    return EColorBadge.SUCCESS;
  }

  /**
   * Get activity level description based on total accesses
   */
  getActivityLevel(totalAccesses: number): string {
    if (!totalAccesses || totalAccesses === 0) {
      return "Sin actividad";
    }
    if (totalAccesses <= 5) {
      return "Poco activo";
    }
    if (totalAccesses <= 15) {
      return "Moderado";
    }
    return "Muy activo";
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  protected readonly Object = Object;
}
