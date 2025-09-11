import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { 
  GetDisabledDays, 
  ToggleDayStatus 
} from '@features/schedule/state/schedule.actions';
import { ScheduleState } from '@features/schedule/state/schedule.state';
import { SnackBarService } from '@core/services/snackbar.service';
import { EDays } from '@shared/enums/days-enum';
import { DisableDayConfirmDialogComponent, DisableDayDialogResult } from '../disable-day-confirm-dialog/disable-day-confirm-dialog.component';

@Component({
  selector: 'app-day-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatSlideToggleModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './day-settings.component.html',
  styleUrls: ['./day-settings.component.css']
})
export class DaySettingsComponent implements OnInit {
  disabledDays$: Observable<string[]>;
  allDays = Object.values(EDays);

  constructor(
    private store: Store,
    private snackbar: SnackBarService,
    private dialog: MatDialog
  ) {
    this.disabledDays$ = this.store.select(ScheduleState.disabledDays);
  }

  ngOnInit(): void {
    // this.store.dispatch(new GetDisabledDays());
  }

  toggleDay(day: string): void {
    const disabledDays = this.store.selectSnapshot(ScheduleState.disabledDays);
    const isCurrentlyDisabled = this.isDayDisabled(day, disabledDays);
    const isDisabling = !isCurrentlyDisabled;

    const dialogRef = this.dialog.open(DisableDayConfirmDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        day,
        isDisabling,
        hoursCount: 0 // En day settings no manejamos horarios específicos
      },
      panelClass: 'disable-day-dialog'
    });

    dialogRef.afterClosed().subscribe((result: DisableDayDialogResult) => {
      if (result?.confirmed) {
        this.store.dispatch(new ToggleDayStatus(day, result.reason)).subscribe({
          next: () => {
            const actionText = isDisabling ? 'deshabilitado' : 'habilitado';
            this.snackbar.showSuccess('Éxito', `Día ${day} ${actionText} correctamente`);
          },
          error: (error) => {
            this.snackbar.showError('Error', 'No se pudo actualizar el estado del día');
            console.error('Error updating day status:', error);
          }
        });
      }
    });
  }

  isDayDisabled(day: string, disabledDays: string[]): boolean {
    return disabledDays.includes(day);
  }

  getDayIcon(day: string): string {
    const icons: { [key: string]: string } = {
      'Lunes': 'calendar',
      'Martes': 'calendar',
      'Miércoles': 'calendar',
      'Jueves': 'calendar',
      'Viernes': 'calendar',
      'Sábado': 'weekend',
      'Domingo': 'weekend'
    };
    return icons[day] || 'calendar';
  }
}
