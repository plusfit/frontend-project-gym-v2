import { Component } from '@angular/core';
import { LoginFormComponent } from '../../components/login-form/login-form.component';
import {BaseLayoutComponent} from "@shared/components/base-layout/base-layout.component";

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [LoginFormComponent, BaseLayoutComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {}
