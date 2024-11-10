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
          console.log(this.schedule);
        }),
      )
      .subscribe(() => {});
  }
}
