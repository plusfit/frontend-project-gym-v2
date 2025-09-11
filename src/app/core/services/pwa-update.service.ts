import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class PwaUpdateService {

  constructor(
    private swUpdate: SwUpdate,
    private snackBar: MatSnackBar
  ) {
    if (swUpdate.isEnabled) {
      this.checkForUpdates();
    }
  }

  private checkForUpdates(): void {
    // Check for new version available
    this.swUpdate.versionUpdates.subscribe(event => {
      if (event.type === 'VERSION_READY') {
        this.promptUser();
      }
    });

    // Check for unrecoverable state
    this.swUpdate.unrecoverable.subscribe(event => {
      this.notifyUnrecoverableState(event.reason);
    });
  }

  private promptUser(): void {
    const snackBarRef = this.snackBar.open(
      'Nueva versión disponible', 
      'Actualizar', 
      {
        duration: 0,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      }
    );

    snackBarRef.onAction().subscribe(() => {
      this.updateApp();
    });
  }

  private updateApp(): void {
    this.swUpdate.activateUpdate().then(() => {
      this.snackBar.open('Aplicación actualizada', 'Cerrar', { duration: 3000 });
      document.location.reload();
    });
  }

  private notifyUnrecoverableState(reason: string): void {
    this.snackBar.open(
      `Error en la aplicación: ${reason}. Recarga la página.`,
      'Recargar',
      {
        duration: 0,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      }
    ).onAction().subscribe(() => {
      document.location.reload();
    });
  }

  // Manual check for updates
  public checkForUpdate(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.checkForUpdate();
    }
  }
}
