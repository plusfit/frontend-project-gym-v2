import { Component, input, output } from '@angular/core';
import { IHour } from '@features/schedule/interfaces/schedule.interface';
import { HourPipe } from '@features/schedule/pipes/hour.pipe';

@Component({
  selector: 'app-card-schedule',
  standalone: true,
  imports: [HourPipe],
  templateUrl: './card-schedule.component.html',
  styleUrl: './card-schedule.component.css',
})
export class CardScheduleComponent {
  hour = input<IHour>();
  day = input<any>();
  edit = output<any>();
  delete = output<any>();

  defaultHour: IHour = {
    startTime: '00',
    endTime: '00',
    maxCount: 0,
    clients: [],
  };

  constructor() {}

  editarHorario(hour: IHour, day: any) {
    this.edit.emit({ hour, day });
  }

  eliminarHorario(hour: IHour) {
    this.delete.emit(hour);
  }
}
