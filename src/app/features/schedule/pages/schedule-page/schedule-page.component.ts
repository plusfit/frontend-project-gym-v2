import { Component, OnInit } from '@angular/core';
import { CalendarScheduleComponent } from '../../components/calendar-schedule/calendar-schedule.component';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { SnackBarService } from '@core/services/snackbar.service';
import { GetSchedule } from '@features/schedule/state/schedule.actions';
import { tap } from 'rxjs';
import { ScheduleState } from '@features/schedule/state/schedule.state';

@Component({
  selector: 'app-schedule-page',
  standalone: true,
  imports: [CalendarScheduleComponent],
  templateUrl: './schedule-page.component.html',
  styleUrl: './schedule-page.component.css',
})
export class SchedulePageComponent implements OnInit {
  schedule!: any;

  constructor(
    private store: Store,
    private actions: Actions,
    private snackbar: SnackBarService,
  ) {}
  ngOnInit(): void {
    this.store.dispatch(new GetSchedule());
    this.actions
      .pipe(
        ofActionSuccessful(GetSchedule),
        tap(() => {
          const schedule = this.store.selectSnapshot(ScheduleState.schedule);
          this.schedule = schedule;
          this.schedule = this.schedule?.data?.reduce((acc: any, hour: any) => {
            // Buscar si el día ya existe en el array de días agrupados
            let dayEntry = acc.find((d: any) => d.day === hour.day);

            if (!dayEntry) {
              // Si el día no existe, lo añadimos con un array vacío de horas
              dayEntry = { day: hour.day, hours: [] };
              acc.push(dayEntry);
            }

            // Añadimos el horario a la lista de horas de ese día
            dayEntry.hours.push({
              _id: hour._id,
              startTime: hour.startTime,
              endTime: hour.endTime,
              clients: hour.clients,
              maxCount: hour.maxCount,
            });

            return acc;
          }, []);
        }),
      )
      .subscribe(() => {});
  }
}
