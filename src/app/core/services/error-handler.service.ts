import { Injectable } from '@angular/core';
import { SnackBarService } from './snackbar.service';
import { ErrorTranslationService } from './error-translation.service';

/**
 * Centralized error handler service that provides convenient methods 
 * for handling common HTTP errors across the application
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(
    private snackBarService: SnackBarService,
    private errorTranslationService: ErrorTranslationService
  ) {}

  /**
   * Handle HTTP errors for CRUD operations with context-aware messages
   * @param error HTTP error response
   * @param operation The operation being performed ('create', 'update', 'delete', 'fetch')
   * @param entityName Optional entity name for more specific error titles
   */
  handleHttpError(
    error: any, 
    operation: 'create' | 'update' | 'delete' | 'fetch' | 'general' | 'validate' = 'general',
    entityName?: string
  ): void {
    const title = this.getErrorTitle(operation, entityName);
    this.snackBarService.showBackendError(error, title, operation);
  }

  /**
   * Handle success messages for CRUD operations
   * @param operation The operation that succeeded
   * @param entityName Optional entity name for more specific success messages
   */
  handleSuccess(
    operation: 'create' | 'update' | 'delete' | 'save' = 'save',
    entityName?: string
  ): void {
    const title = 'Éxito';
    const message = this.getSuccessMessage(operation, entityName);
    this.snackBarService.showSuccess(title, message);
  }

  /**
   * Handle validation errors specifically
   * @param error Validation error response
   * @param customMessage Optional custom validation message
   */
  handleValidationError(error: any, customMessage?: string): void {
    if (customMessage) {
      this.snackBarService.showError('Error de Validación', customMessage);
    } else {
      this.snackBarService.showBackendError(error, 'Error de Validación', 'general');
    }
  }

  /**
   * Handle network/connection errors
   * @param error Network error
   */
  handleNetworkError(error: any): void {
    this.snackBarService.showError(
      'Error de Conexión', 
      'No se pudo conectar al servidor. Verifique su conexión a internet.'
    );
  }

  /**
   * Handle permission/authorization errors
   * @param error Authorization error
   */
  handleAuthError(error: any): void {
    this.snackBarService.showBackendError(error, 'Error de Autorización');
  }

  /**
   * Add custom error translations at runtime
   * @param translations Object with new error translations
   */
  addErrorTranslations(translations: Record<string, string>): void {
    this.errorTranslationService.addTranslations(translations);
  }

  /**
   * Get appropriate error title based on operation and entity
   * @param operation CRUD operation
   * @param entityName Entity being operated on
   * @returns Localized error title
   */
  private getErrorTitle(
    operation: 'create' | 'update' | 'delete' | 'fetch' | 'general' | 'validate',
    entityName?: string
  ): string {
    const entityPart = entityName ? ` ${entityName}` : '';
    
    switch (operation) {
      case 'create':
        return `Error al crear${entityPart}`;
      case 'update':
        return `Error al actualizar${entityPart}`;
      case 'delete':
        return `Error al eliminar${entityPart}`;
      case 'fetch':
        return `Error al cargar${entityPart}`;
      case 'validate':
        return `Error de validación${entityPart}`;
      default:
        return 'Error';
    }
  }

  /**
   * Get appropriate success message based on operation and entity
   * @param operation CRUD operation
   * @param entityName Entity being operated on
   * @returns Localized success message
   */
  private getSuccessMessage(
    operation: 'create' | 'update' | 'delete' | 'save',
    entityName?: string
  ): string {
    const entityPart = entityName ? ` ${entityName}` : '';
    
    switch (operation) {
      case 'create':
        return `${entityName || 'Registro'} creado exitosamente`;
      case 'update':
        return `${entityName || 'Registro'} actualizado exitosamente`;
      case 'delete':
        return `${entityName || 'Registro'} eliminado exitosamente`;
      case 'save':
        return `${entityName || 'Registro'} guardado exitosamente`;
      default:
        return 'Operación completada exitosamente';
    }
  }
}