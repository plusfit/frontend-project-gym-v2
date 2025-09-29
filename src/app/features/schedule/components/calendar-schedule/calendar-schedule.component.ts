import { AsyncPipe, JsonPipe } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    Input,
    output,
    signal,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { SnackBarService } from '@core/services/snackbar.service';
import {
    ClearClients,
    ClearSelectedClient,
    DeleteHour,
} from '@features/schedule/state/schedule.actions';
import { ScheduleState } from '@features/schedule/state/schedule.state';
import { Actions, Store, ofActionSuccessful } from '@ngxs/store';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { EDays } from '@shared/enums/days-enum';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { CardScheduleComponent } from '../card-schedule/card-schedule.component';
import { ScheduleFormComponent } from '../schedule-form/schedule-form.component';

@Component({
  selector: 'app-calendar-schedule',
  standalone: true,
  imports: [
    CardScheduleComponent,
    AsyncPipe,
    LoaderComponent,
    MatExpansionModule,
    JsonPipe,
  ],
  templateUrl: './calendar-schedule.component.html',
  styleUrl: './calendar-schedule.component.css',
})
export class CalendarScheduleComponent implements AfterViewInit {
  @Input() schedule: any;
  currentDay: string;

  days = Object.values(EDays);

  scheduleUpdated = output<any>({
    alias: 'scheduleUpdated',
  });
  loading$ = this.store.select(ScheduleState.scheduleLoading);
  readonly panelOpenState = signal(false);
  // Mapeo de estado para controlar qué paneles están abiertos
  readonly panelStates = signal<Record<string, boolean>>({});

  constructor(
    private store: Store,
    private actions: Actions,
    private snackbar: SnackBarService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
  ) {
    this.currentDay = this.getCurrentDay();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  editarHorario(event: Event) {
    // Lógica para abrir un formulario de edición
    this.dialog
      .open(ScheduleFormComponent, {
        width: '500px',
        data: {
          title: 'Editar horario',
          day: event,
        },
      })
      .afterClosed()
      .subscribe(() => {
        // Despacha la acción para limpiar el estado de clientes
        this.store.dispatch(new ClearClients());
        this.store.dispatch(new ClearSelectedClient());
      });
  }

  eliminarHorario(event: { _id: string; startTime: string }) {
    const time =
      parseFloat(event.startTime) > 12
        ? `${parseFloat(event.startTime)} PM`
        : `${parseFloat(event.startTime)} AM`;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: `Eliminar horario ${time}`,
        contentMessage: '¿Estás seguro de que deseas eliminar este horario?',
      },
    });
    dialogRef.componentInstance.confirm.subscribe((value) => {
      if (!value) return;
      const _id = event._id;
      this.store.dispatch(new DeleteHour(_id));
      this.actions.pipe(ofActionSuccessful(DeleteHour)).subscribe(() => {
        this.snackbar.showSuccess('Éxito!', 'Horario eliminado');
      });
    });
  }

  getCurrentDay(): string {
    const date = new Date();
    const day = date.getDay();

    return this.days[day];
  }
}
