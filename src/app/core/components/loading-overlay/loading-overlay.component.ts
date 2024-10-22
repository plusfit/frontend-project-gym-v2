/* eslint-disable prettier/prettier */
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoadingOverlayService } from '@core/services/loading-overlay.service';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-overlay.component.html',
  styleUrl: './loading-overlay.component.css',
})
export class LoadingOverlayComponent {
  isLoading$ = this.loadingService.isLoading$;

  constructor(private loadingService: LoadingOverlayService) {}
}
