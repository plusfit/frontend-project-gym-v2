import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { ErrorMessages, SnackBarHeaders } from "@core/enums/messages.enum";
import { SnackBarService } from "@core/services/snackbar.service";
import { getFriendlyErrorMessage } from "@core/utilities/helpers";
import { Observable, catchError, throwError } from "rxjs";

export function errorInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const snackBar = inject(SnackBarService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      let message = "";
      if (err.error instanceof ProgressEvent) {
        // Client Side
        switch (err.status) {
          case 0:
            message = ErrorMessages.ConnectionError;
            break;
          case 503:
            message = ErrorMessages.ServiceUnavailable;
            break;
          default:
            message = err.statusText;
            break;
        }
      } else {
        // Server Side - Usar la función helper para obtener el mensaje más específico
        message = getFriendlyErrorMessage(err);
      }

      if (message === "Failed to fetch") {
        message = "Por favor recargue la página";
      }
      snackBar.showError(SnackBarHeaders.Error, message);
      return throwError(() => err);
    }),
  );
}
