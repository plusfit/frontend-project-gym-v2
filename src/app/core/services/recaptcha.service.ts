import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

@Injectable({
  providedIn: "root",
})
export class RecaptchaService {
  private siteKey = environment.recaptcha.siteKey;
  private scriptLoaded = false;

  /**
   * Carga el script de reCAPTCHA v3 dinámicamente
   * @returns Promise<void>
   */
  private loadRecaptchaScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.scriptLoaded || window.grecaptcha) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?render=${this.siteKey}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error("Error al cargar el script de reCAPTCHA"));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Ejecuta reCAPTCHA v3 y devuelve el token
   * @param action - La acción que se está realizando (ej: 'login')
   * @returns Observable con el token de reCAPTCHA
   */
  executeRecaptcha(action: string): Observable<string> {
    return new Observable((observer) => {
      this.loadRecaptchaScript()
        .then(() => {
          if (!window.grecaptcha) {
            observer.error("reCAPTCHA no está disponible");
            return;
          }

          window.grecaptcha.ready(() => {
            window.grecaptcha
              .execute(this.siteKey, { action })
              .then((token: string) => {
                observer.next(token);
                observer.complete();
              })
              .catch((error: Error) => {
                observer.error(error);
              });
          });
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  /**
   * Verifica si reCAPTCHA está listo para usar
   * @returns Promise<boolean>
   */
  isRecaptchaReady(): Promise<boolean> {
    return new Promise((resolve) => {
      this.loadRecaptchaScript()
        .then(() => {
          if (window.grecaptcha) {
            window.grecaptcha.ready(() => {
              resolve(true);
            });
          } else {
            resolve(false);
          }
        })
        .catch(() => {
          resolve(false);
        });
    });
  }

  /**
   * Obtiene la site key de reCAPTCHA
   * @returns string
   */
  getSiteKey(): string {
    return this.siteKey;
  }
}
