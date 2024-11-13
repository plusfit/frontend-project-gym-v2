import {
  Component,
  input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CardScheduleComponent } from '../card-schedule/card-schedule.component';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { DeleteHour } from '@features/schedule/state/schedule.actions';
import { SnackBarService } from '@core/services/snackbar.service';

@Component({
  selector: 'app-calendar-schedule',
  standalone: true,
  imports: [CardScheduleComponent],
  templateUrl: './calendar-schedule.component.html',
  styleUrl: './calendar-schedule.component.css',
})
export class CalendarScheduleComponent implements OnInit, OnChanges {
  schedule = input<any>();

  constructor(
    private store: Store,
    private actions: Actions,
    private snackbar: SnackBarService,
  ) {}
  ngOnInit(): void {
    console.log(this.schedule());
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['schedule']) {
      console.log('changes', this.schedule());
    }
  }

  editarHorario(event: Event) {
    console.log('Evento editando', event);
    // Lógica para abrir un formulario de edición
  }

  eliminarHorario(event: { _id: string }) {
    const _id = event._id;
    this.store.dispatch(new DeleteHour(_id));
    this.actions.pipe(ofActionSuccessful(DeleteHour)).subscribe(() => {
      this.snackbar.showSuccess('Horario eliminado', 'Cerrar');
      this.schedule = this.schedule()?.filter((hour: any) => hour._id !== _id);
    });
    console.log('Evento eliminado', event);
    // Lógica para eliminar el horario
  }
}
