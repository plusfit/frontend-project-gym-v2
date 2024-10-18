import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BaseLayoutComponent } from '@shared/components/base-layout/base-layout.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [BaseLayoutComponent, RouterOutlet],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css',
})
export class AuthLayoutComponent {}
