import { Injectable } from '@angular/core';
import { ERROR_TRANSLATIONS, DEFAULT_ERROR_MESSAGES } from '../constants/error-translations.constants';

/**
 * Interface for error translation mapping
 */
export interface ErrorTranslation {
  [key: string]: string;
}

/**
 * Service for translating backend error messages to localized messages
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorTranslationService {
  /**
   * Map of backend error messages to Spanish translations
   */
  private readonly errorTranslations: ErrorTranslation = { ...ERROR_TRANSLATIONS };

  /**
   * Default error messages for different contexts
   */
  private readonly defaultErrors = { ...DEFAULT_ERROR_MESSAGES };

  /**
   * Translates a backend error message to Spanish
   * @param errorMessage The error message from backend
   * @param context Optional context (create, update, delete, fetch)
   * @returns Translated error message
   */
  translateError(errorMessage: string, context?: keyof typeof this.defaultErrors): string {
    // First try to find exact match
    if (this.errorTranslations[errorMessage]) {
      return this.errorTranslations[errorMessage];
    }

    // Try to find partial match (case insensitive)
    const lowerMessage = errorMessage.toLowerCase();
    for (const [key, translation] of Object.entries(this.errorTranslations)) {
      if (lowerMessage.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerMessage)) {
        return translation;
      }
    }

    // If context is provided, return context-specific default
    if (context && this.defaultErrors[context]) {
      return this.defaultErrors[context];
    }

    // Return general default
    return this.defaultErrors.general;
  }

  /**
   * Extracts and translates error message from HTTP error response
   * @param error HTTP error response
   * @param context Optional context for fallback message
   * @returns Translated error message
   */
  extractAndTranslateError(error: any, context?: keyof typeof this.defaultErrors): string {
    let errorMessage = '';

    // Extract message from different possible error structures
    if (error?.error?.data?.message) {
      errorMessage = error.error.data.message;
    } else if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    return this.translateError(errorMessage, context);
  }

  /**
   * Adds new error translations at runtime
   * @param translations Object with error translations to add
   */
  addTranslations(translations: ErrorTranslation): void {
    Object.assign(this.errorTranslations, translations);
  }

  /**
   * Gets all available error translations
   * @returns Copy of error translations object
   */
  getAllTranslations(): ErrorTranslation {
    return { ...this.errorTranslations };
  }
}