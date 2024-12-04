import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from '../navigation/navigation.component';
import { UserAreaComponent } from '../user-area/user-area.component';
import { WelcomeComponent } from '../welcome/welcome.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    NavigationComponent,
    RouterOutlet,
    UserAreaComponent,
    WelcomeComponent,
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css',
})
export class DashboardLayoutComponent {}
