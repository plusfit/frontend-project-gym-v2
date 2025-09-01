import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { 
  GetDisabledDays, 
  ToggleDayStatus 
} from '@features/schedule/state/schedule.actions';
import { ScheduleState } from '@features/schedule/state/schedule.state';
import { SnackBarService } from '@core/services/snackbar.service';
import { EDays } from '@shared/enums/days-enum';

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
    private snackbar: SnackBarService
  ) {
    this.disabledDays$ = this.store.select(ScheduleState.disabledDays);
  }

  ngOnInit(): void {
    // this.store.dispatch(new GetDisabledDays());
  }

  toggleDay(day: string): void {
    this.store.dispatch(new ToggleDayStatus(day)).subscribe({
      next: () => {
        this.snackbar.showSuccess('Éxito', `Estado del día ${day} actualizado`);
      },
      error: (error) => {
        this.snackbar.showError('Error', 'No se pudo actualizar el estado del día');
        console.error('Error updating day status:', error);
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
