import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

/**
 * The UtilsService provides utility methods for common tasks.
 */
@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  /**
   * The JWT helper service for the utility service.
   */
  jwtHelper = new JwtHelperService();

  /**
   * Creates an instance of the UtilsService class.
   * @param {object} platformId - The platform ID to use for the service.
   */
  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  /**
   * Returns whether the current platform is a browser.
   * @returns Whether the current platform is a browser.
   */
  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Clears the session storage if the current platform is a browser.
   */
  cleanStorage(): void {
    if (this.isBrowser) {
      sessionStorage.clear();
      // Limpiar datos específicos del usuario en localStorage
      localStorage.removeItem('organizationId');
      localStorage.removeItem('userPermissions');
    }
  }

  /**
   * Returns whether the specified JWT token is expired.
   * @param {string} token The JWT token to check.
   * @returns Whether the specified JWT token is expired.
   */
  isTokenExpired(token: string): boolean {
    return this.jwtHelper.isTokenExpired(token);
  }

  /**
   * Returns the user ID from the specified JWT token.
   * @param {string} token The JWT token to get the user ID from.
   * @returns The user ID from the specified JWT token.
   */
  getUserIdFromToken(token: string): string {
    const decoded = token && this.jwtHelper.decodeToken(token);
    return decoded.id;
  }
}
