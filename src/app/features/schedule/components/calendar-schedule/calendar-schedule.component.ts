import { Component } from '@angular/core';

@Component({
  selector: 'app-calendar-schedule',
  standalone: true,
  imports: [],
  templateUrl: './calendar-schedule.component.html',
  styleUrl: './calendar-schedule.component.css',
})
export class CalendarScheduleComponent {
  daysArray = [
    {
      day: 'Lunes',
      hours: [
        { startTime: '08:00', endTime: '09:00', clients: [], maxCount: 3 },
        { startTime: '10:00', endTime: '11:00', clients: [], maxCount: 3 },
        { startTime: '14:00', endTime: '15:00', clients: [], maxCount: 3 },
      ],
    },
    {
      day: 'Martes',
      hours: [
        { startTime: '09:00', endTime: '10:00', clients: [], maxCount: 2 },
        { startTime: '11:00', endTime: '12:00', clients: [], maxCount: 2 },
      ],
    },
    {
      day: 'Miércoles',
      hours: [
        { startTime: '07:00', endTime: '08:00', clients: [], maxCount: 2 },
        { startTime: '12:00', endTime: '13:00', clients: [], maxCount: 2 },
      ],
    },
    {
      day: 'Jueves',
      hours: [
        { startTime: '10:00', endTime: '11:00', clients: [], maxCount: 2 },
        { startTime: '16:00', endTime: '17:00', clients: [], maxCount: 2 },
      ],
    },
    {
      day: 'Viernes',
      hours: [
        { startTime: '09:00', endTime: '10:00', clients: [], maxCount: 3 },
        { startTime: '11:00', endTime: '12:00', clients: [], maxCount: 3 },
        { startTime: '15:00', endTime: '16:00', clients: [], maxCount: 3 },
      ],
    },
    {
      day: 'Sábado',
      hours: [
        { startTime: '08:00', endTime: '09:00', clients: [], maxCount: 2 },
        { startTime: '12:00', endTime: '13:00', clients: [], maxCount: 2 },
      ],
    },
  ];

  editarHorario(day: any, hour: any) {
    console.log(
      `Editando el horario de ${day.day} de ${hour.startTime} a ${hour.endTime}`,
    );
    // Lógica para abrir un formulario de edición
  }

  eliminarHorario(day: any, hour: any) {
    console.log(
      `Eliminando el horario de ${day.day} de ${hour.startTime} a ${hour.endTime}`,
    );
    // Lógica para eliminar el horario
  }
}
