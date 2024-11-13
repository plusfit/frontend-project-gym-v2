import { Component, input, output } from '@angular/core';
import { IHour } from '@features/schedule/interfaces/schedule.interface';

@Component({
  selector: 'app-card-schedule',
  standalone: true,
  imports: [],
  templateUrl: './card-schedule.component.html',
  styleUrl: './card-schedule.component.css',
})
export class CardScheduleComponent {
  hour = input<IHour>();
  day = input<any>();
  edit = output<any>();
  delete = output<any>();

  constructor() {}

  editarHorario(hour: any) {
    this.edit.emit(hour);
  }

  eliminarHorario(hour: any) {
    this.delete.emit(hour);
  }
}
