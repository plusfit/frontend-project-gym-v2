import { Component } from '@angular/core';
import { ForgotPasswordFormComponent } from '../../components/forgot-password-form/forgot-password-form.component';
import { BaseLayoutComponent } from '@shared/components/base-layout/base-layout.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ForgotPasswordFormComponent, BaseLayoutComponent],
  templateUrl: './forgot-password-page.component.html',
  styleUrl: './forgot-password-page.component.css',
})
export class ForgotPasswordPageComponent {}
