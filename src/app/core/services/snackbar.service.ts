import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from '@shared/components/snackbar/snackbar.component';
import { ESeverity } from '@shared/enums/severity.enum';

/**
 * The SnackBarService provides methods to show snack bar notifications with different severity levels.
 */
@Injectable({
  providedIn: 'root',
})
export class SnackBarService {
  constructor(private snackBar: MatSnackBar) {}

  /**
   * Shows an error snack bar notification with the specified title and message.
   * @param {string} title The title of the snack bar notification.
   * @param {string} message The message of the snack bar notification.
   */
  showError(title: string, message: string): void {
    console.log('SnackBarService.showError');
    this.showSnackBar(ESeverity.ERROR, title, message);
  }

  /**
   * Shows a success snack bar notification with the specified title and message.
   * @param  {string} title The title of the snack bar notification.
   * @param  {string} message The message of the snack bar notification.
   */
  showSuccess(title: string, message: string): void {
    this.showSnackBar(ESeverity.SUCCESS, title, message);
  }

  /**
   * Shows an info snack bar notification with the specified title and message.
   * @param  {string} title The title of the snack bar notification.
   * @param  {string} message The message of the snack bar notification.
   */
  showInfo(title: string, message: string): void {
    this.showSnackBar(ESeverity.INFO, title, message);
  }

  /**
   * Shows a warning snack bar notification with the specified title and message.
   * @param  {string} title The title of the snack bar notification.
   * @param  {string} message The message of the snack bar notification.
   */
  showWarning(title: string, message: string): void {
    this.showSnackBar(ESeverity.WARNING, title, message);
  }

  /**
   * Shows a snack bar notification with the specified severity, title and message.
   * @param {ESeverity} severity The severity of the snack bar notification.
   * @param {string} title The title of the snack bar notification.
   * @param {string} message The message of the snack bar notification.
   */
  private showSnackBar(
    severity: ESeverity,
    title: string,
    message: string,
  ): void {
    this.snackBar.openFromComponent(SnackBarComponent, {
      data: {
        title,
        message,
        severity,
      },
    });
  }
}
