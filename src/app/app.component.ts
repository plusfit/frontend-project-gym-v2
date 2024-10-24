import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LoadingOverlayComponent } from '@core/components/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterOutlet, MatSlideToggleModule, LoadingOverlayComponent],
})
export class AppComponent {
  title = 'angular-boilerplate';
}
