import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NetworkStatusService {
  private isOnline$ = new BehaviorSubject<boolean>(navigator.onLine);

  constructor(private snackBar: MatSnackBar) {
    this.initializeNetworkListener();
  }

  get isOnline() {
    return this.isOnline$.asObservable();
  }

  get isOffline() {
    return this.isOnline$.pipe(map(isOnline => !isOnline));
  }

  private initializeNetworkListener(): void {
    if (typeof window !== 'undefined') {
      merge(
        of(navigator.onLine),
        fromEvent(window, 'online').pipe(map(() => true)),
        fromEvent(window, 'offline').pipe(map(() => false))
      ).subscribe(isOnline => {
        this.isOnline$.next(isOnline);
        this.handleNetworkChange(isOnline);
      });
    }
  }

  private handleNetworkChange(isOnline: boolean): void {
    if (isOnline) {
      this.snackBar.open(
        '✅ Conexión restablecida',
        '',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        }
      );
    } else {
      this.snackBar.open(
        '⚠️ Sin conexión - Modo offline',
        '',
        {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['warning-snackbar']
        }
      );
    }
  }
}
