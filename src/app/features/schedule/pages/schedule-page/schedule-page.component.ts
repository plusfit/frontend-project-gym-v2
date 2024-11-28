import { Component, OnInit } from '@angular/core';
import { CalendarScheduleComponent } from '../../components/calendar-schedule/calendar-schedule.component';
import { Actions, Store } from '@ngxs/store';
import { SnackBarService } from '@core/services/snackbar.service';
import { GetSchedule } from '@features/schedule/state/schedule.actions';
import { ScheduleState } from '@features/schedule/state/schedule.state';
import { AsyncPipe, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-schedule-page',
  standalone: true,
  imports: [CalendarScheduleComponent, AsyncPipe, JsonPipe],
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
    this.schedule = this.store.select(ScheduleState.schedule);
  }

  actualizarSchedule(nuevoHorario: any[]) {
    this.schedule = nuevoHorario;
  }
}
