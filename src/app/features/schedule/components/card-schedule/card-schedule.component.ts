import { NgClass, NgStyle } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { IHour } from '@features/schedule/interfaces/schedule.interface';
import { HourPipe } from '@features/schedule/pipes/hour.pipe';

@Component({
  selector: 'app-card-schedule',
  standalone: true,
  imports: [HourPipe, NgClass, NgStyle, MatMenu, MatMenuItem, MatMenuTrigger],
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
    clients: [{ clients: '' }],
  };

  constructor() {}

  editarHorario(hour: IHour, day: any) {
    this.edit.emit({ hour, name: day.day });
  }

  eliminarHorario(hour: IHour) {
    this.delete.emit(hour);
  }

  getPercentageOccupation(): number {
    const clientsCount = this.hour()?.clients?.length || 0;
    const maxCount = this.hour()?.maxCount || 1; // Avoid division by zero
    return Math.min(Math.round((clientsCount / maxCount) * 100), 100); // Cap at 100%
  }

  getBackgroundClass(hour: any): string {
    const clientsCount = hour.clients?.length || 0;
    const maxCount = hour?.maxCount || 0;

    if (clientsCount === maxCount) {
      return 'from-red-100 to-red-200 border-2 border-red-300';
    }
    if (clientsCount >= maxCount / 2) {
      return 'from-yellow-100 to-yellow-200 border-2 border-yellow-300';
    }
    return 'from-green-100 to-green-200 border-2 border-green-300';
  }

  getTextClass(hour: any): string {
    const clientsCount = hour.clients?.length || 0;
    const maxCount = hour?.maxCount || 0;

    if (clientsCount === maxCount) {
      return 'text-red-700';
    }
    if (clientsCount >= maxCount / 2) {
      return 'text-yellow-700';
    }
    return 'text-green-700';
  }
}
