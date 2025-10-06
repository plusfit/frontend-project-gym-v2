import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LoadingOverlayComponent } from '@core/components/loading-overlay/loading-overlay.component';
import { PwaUpdateService } from '@core/services/pwa-update.service';
import { PwaInstallService } from '@core/services/pwa-install.service';
import { NetworkStatusService } from '@core/services/network-status.service';
import { PwaInstallButtonComponent } from '@core/components/pwa-install-button/pwa-install-button.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterOutlet, MatSlideToggleModule, LoadingOverlayComponent, PwaInstallButtonComponent],
})
export class AppComponent implements OnInit {
  title = '+Fit';

  constructor(
    private pwaUpdateService: PwaUpdateService,
    private pwaInstallService: PwaInstallService,
  ) {}

  ngOnInit() {
    // Los servicios se inicializan automáticamente a través de la inyección de dependencias
  }
}
