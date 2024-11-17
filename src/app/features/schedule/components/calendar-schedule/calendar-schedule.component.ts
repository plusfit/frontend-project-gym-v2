import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  input,
  OnChanges,
  OnInit,
  output,
  SimpleChanges,
} from '@angular/core';
import { CardScheduleComponent } from '../card-schedule/card-schedule.component';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { DeleteHour } from '@features/schedule/state/schedule.actions';
import { SnackBarService } from '@core/services/snackbar.service';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ScheduleFormComponent } from '../schedule-form/schedule-form.component';

@Component({
  selector: 'app-calendar-schedule',
  standalone: true,
  imports: [CardScheduleComponent],
  templateUrl: './calendar-schedule.component.html',
  styleUrl: './calendar-schedule.component.css',
})
export class CalendarScheduleComponent
  implements OnInit, OnChanges, AfterViewInit
{
  schedule = input<any>();
  scheduleUpdated = output<any>({
    alias: 'scheduleUpdated',
  });

  constructor(
    private store: Store,
    private actions: Actions,
    private snackbar: SnackBarService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    console.log(this.schedule());
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['schedule']) {
      console.log('changes', this.schedule());
    }
  }
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  editarHorario(event: Event) {
    console.log('Evento editando', event);
    // Lógica para abrir un formulario de edición
    this.dialog.open(ScheduleFormComponent, {
      width: '500px',
      data: {
        title: 'Editar horario',
        day: event,
      },
    });
  }

  eliminarHorario(event: { _id: string }) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'Eliminar horario',
        contentMessage: '¿Estás seguro de que deseas eliminar este horario?',
      },
    });
    dialogRef.componentInstance.confirm.subscribe((value) => {
      if (!value) return;
      const _id = event._id;
      this.store.dispatch(new DeleteHour(_id));
      this.actions.pipe(ofActionSuccessful(DeleteHour)).subscribe(() => {
        this.snackbar.showSuccess('Horario eliminado', 'Cerrar');
        // Filtra y emite el nuevo horario al componente padre
        const updatedSchedule = this.schedule().map((day: any) => {
          return {
            ...day,
            hours: day.hours.filter((hour: any) => hour._id !== _id),
          };
        });
        this.scheduleUpdated.emit(updatedSchedule);
      });
      console.log('Evento eliminado', event);
    });
  }
}
