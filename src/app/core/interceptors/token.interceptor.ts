import {
  HttpErrorResponse,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthState } from '@features/auth/state/auth.state';
import { Store } from '@ngxs/store';
import { Observable, catchError, throwError } from 'rxjs';

/**
 * Interceptor to handle Tokens
 * @implements HttpInterceptor
 */
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  /**
   * Creates an instance of the TokenInterceptor class.
   * @param {Store} store - The store to use for the interceptor.
   */
  constructor(public store: Store) {}

  /**
   * Intercepts an outgoing HTTP request and adds an access token to it.
   * @param {HttpRequest<unknown>} request The outgoing HTTP request.
   * @param {HttpHandler} next The next HTTP handler in the chain.
   * @returns An observable of the HTTP response.
   */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<any> {
    const token = this.store.selectSnapshot(AuthState.accessToken);

    if (token) {
      request = this.addToken(request, token, 'Bearer');
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      }),
    );
  }

  /**
   * Adds an access token to an HTTP request.
   * @param request The HTTP request to modify.
   * @param token The access token to add.
   * @param tokenType The type of the access token.
   * @returns The modified HTTP request.
   */
  private addToken(
    request: HttpRequest<unknown>,
    token: string,
    tokenType: string,
  ): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `${tokenType} ${token}`,
      },
    });
  }
}
