import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PwaInstallService } from '@core/services/pwa-install.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-pwa-install-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <button
      *ngIf="(canInstall$ | async) && !isInstalled"
      mat-raised-button
      color="primary"
      (click)="installApp()"
      class="pwa-install-button"
    >
      <mat-icon>get_app</mat-icon>
      Instalar App
    </button>
  `,
  styles: [`
    .pwa-install-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      border-radius: 25px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    
    @media (max-width: 768px) {
      .pwa-install-button {
        bottom: 80px;
        right: 16px;
      }
    }
  `]
})
export class PwaInstallButtonComponent implements OnInit {
  canInstall$: Observable<boolean>;
  isInstalled = false;

  constructor(private pwaInstallService: PwaInstallService) {
    this.canInstall$ = this.pwaInstallService.canInstall;
  }

  ngOnInit() {
    this.isInstalled = this.pwaInstallService.isInstalled();
  }

  async installApp() {
    const installed = await this.pwaInstallService.installApp();
    if (installed) {
      this.isInstalled = true;
    }
  }
}
