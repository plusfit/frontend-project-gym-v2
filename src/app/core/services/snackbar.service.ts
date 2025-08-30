import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from '@shared/components/snackbar/snackbar.component';
import { ESeverity } from '@shared/enums/severity.enum';
import { ErrorTranslationService } from './error-translation.service';

/**
 * The SnackBarService provides methods to show snack bar notifications with different severity levels.
 */
@Injectable({
  providedIn: 'root',
})
export class SnackBarService {
  constructor(
    private snackBar: MatSnackBar,
    private errorTranslationService: ErrorTranslationService
  ) {}

  /**
   * Shows an error snack bar notification with the specified title and message.
   * @param {string} title The title of the snack bar notification.
   * @param {string} message The message of the snack bar notification.
   */
  showError(title: string, message: string): void {
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
   * Shows an error snack bar notification with translated backend error message.
   * @param {any} error HTTP error response from backend
   * @param {string} title The title of the snack bar notification
   * @param {'create' | 'update' | 'delete' | 'fetch' | 'general'} context Operation context for fallback message
   */
  showBackendError(
    error: any, 
    title: string = 'Error', 
    context?: 'create' | 'update' | 'delete' | 'fetch' | 'general'
  ): void {
    const translatedMessage = this.errorTranslationService.extractAndTranslateError(error, context);
    this.showError(title, translatedMessage);
  }

  /**
   * Shows a translated error message.
   * @param {string} errorMessage Backend error message to translate
   * @param {string} title The title of the snack bar notification
   * @param {'create' | 'update' | 'delete' | 'fetch' | 'general'} context Operation context for fallback message
   */
  showTranslatedError(
    errorMessage: string, 
    title: string = 'Error',
    context?: 'create' | 'update' | 'delete' | 'fetch' | 'general'
  ): void {
    const translatedMessage = this.errorTranslationService.translateError(errorMessage, context);
    this.showError(title, translatedMessage);
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
