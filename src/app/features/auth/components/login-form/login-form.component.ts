import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Observable, Subject, takeUntil } from "rxjs";

import { AsyncPipe, NgClass } from "@angular/common";
import { Router } from "@angular/router";
import { SnackBarService } from "@core/services/snackbar.service";
import { RecaptchaService } from "@core/services/recaptcha.service";
import { passwordValidator } from "@core/validators/password.validator";
import { Actions, ofActionSuccessful, Store } from "@ngxs/store";
import { BtnDirective } from "@shared/directives/btn/btn.directive";
import { InputDirective } from "@shared/directives/btn/input.directive";
import { ConditionalTextPipe } from "@shared/pipes/conditional-text.pipe";
import { Login } from "../../state/auth.actions";
import { AuthState } from "../../state/auth.state";

@Component({
  selector: "app-login-form",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    BtnDirective,
    AsyncPipe,
    ConditionalTextPipe,
    InputDirective,
  ],
  templateUrl: "./login-form.component.html",
  styleUrl: "./login-form.component.css",
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginFormComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;

  showPassword = false;
  private destroy = new Subject<void>();

  loading$: Observable<boolean> = this.store.select(AuthState.authLoading);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private store: Store,
    private actions: Actions,
    private snackbar: SnackBarService,
    private recaptchaService: RecaptchaService,
  ) {}

  ngOnInit(): void {
    // Create the login form with email and password fields
    this.loginForm = this.fb.group({
      identifier: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, passwordValidator()]],
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  /**
   * Authenticate the user and redirect to dashboard
   * @returns void
   */
  login(): void {
    if (this.loginForm.valid) {
      // Ejecutar reCAPTCHA v3 antes de enviar las credenciales
      this.recaptchaService.executeRecaptcha("login").subscribe({
        next: (recaptchaToken: string) => {
          // Agregar el token de reCAPTCHA a los datos del formulario
          const loginData = {
            ...this.loginForm.value,
            recaptchaToken,
          };

          this.store.dispatch(new Login(loginData));
          this.actions.pipe(ofActionSuccessful(Login), takeUntil(this.destroy)).subscribe(() => {
            this.router.navigate(["/"]);
            //TODO
            //this.store.dispatch(GetUserPreferences);
            this.snackbar.showSuccess("Éxito!", "Bienvenido");
          });
        },
        error: (error) => {
          console.error("Error al ejecutar reCAPTCHA:", error);
          this.snackbar.showError(
            "Error de verificación",
            "No se pudo verificar que eres humano. Inténtalo de nuevo.",
          );
        },
      });
    }
  }

  loginWithGoogle(): void {}
  goToForgotPassword(): void {
    this.router.navigate(["auth/forgot-password"]);
  }
  goToRegister(): void {
    this.router.navigate(["auth/register"]);
  }
}
