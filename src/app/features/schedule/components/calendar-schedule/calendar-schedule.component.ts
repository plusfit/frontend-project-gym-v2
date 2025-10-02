import { AsyncPipe, JsonPipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  output,
  signal,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SnackBarService } from '@core/services/snackbar.service';
import {
  ClearClients,
  ClearSelectedClient,
  DeleteHour,
  ToggleDayStatus,
  ToggleAllDaySchedules,
} from '@features/schedule/state/schedule.actions';
import { ScheduleState } from '@features/schedule/state/schedule.state';
import { Actions, Store, ofActionSuccessful } from '@ngxs/store';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { EDays } from '@shared/enums/days-enum';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { CardScheduleComponent } from '../card-schedule/card-schedule.component';
import { ScheduleFormComponent } from '../schedule-form/schedule-form.component';
import { DisableDayConfirmDialogComponent, DisableDayDialogResult } from '../disable-day-confirm-dialog/disable-day-confirm-dialog.component';

@Component({
  selector: 'app-calendar-schedule',
  standalone: true,
  imports: [
    CardScheduleComponent,
    AsyncPipe,
    LoaderComponent,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTooltipModule,
  ],
  templateUrl: './calendar-schedule.component.html',
  styleUrl: './calendar-schedule.component.css',
})
export class CalendarScheduleComponent implements AfterViewInit, OnChanges {
  @Input() schedule: any;
  currentDay: string;

  days = Object.values(EDays);
  loading$ = this.store.select(ScheduleState.scheduleLoading);
  disabledDays$ = this.store.select(ScheduleState.disabledDays);
  
  // Asegurar que todos los días estén representados
  allDaysSchedule: any[] = [];

  // Configuración para usar backend o localStorage
  private useBackendForToggle = false; // Usar localStorage para mostrar todos los horarios

  scheduleUpdated = output<any>({
    alias: 'scheduleUpdated',
  });
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
    // Inicializar con todos los días
    this.updateAllDaysSchedule();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  ngOnChanges() {
    this.updateAllDaysSchedule();
  }

  updateAllDaysSchedule(): void {
    if (!this.schedule) return;
    
    // Crear una representación de todos los días de la semana
    this.allDaysSchedule = this.days.map(day => {
      const existingDay = this.schedule.find((d: any) => d.day === day);
      return existingDay || { day, hours: [] };
    });
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

  toggleDayStatus(day: string): void {
    const disabledDays = this.store.selectSnapshot(ScheduleState.disabledDays);
    const isCurrentlyDisabled = this.isDayDisabled(day, disabledDays);
    const isDisabling = !isCurrentlyDisabled; // Si no está deshabilitado, lo vamos a deshabilitar
    
    // Encontrar el día en el schedule para obtener el número de horarios
    const dayData = this.allDaysSchedule.find(d => d.day === day);
    const hoursCount = dayData?.hours?.length || 0;

    // Abrir modal de confirmación
    const dialogRef = this.dialog.open(DisableDayConfirmDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        day,
        isDisabling,
        hoursCount
      },
      panelClass: 'disable-day-dialog'
    });

    console.log('Dialog data:', { day, isDisabling, hoursCount }); // Debug log

    dialogRef.afterClosed().subscribe((result: DisableDayDialogResult) => {
      if (result?.confirmed) {
        // Elegir qué acción usar basado en la configuración
        let actionObservable;
        
          // Usar el endpoint del backend para deshabilitar horarios individuales
          actionObservable = this.store.dispatch(new ToggleAllDaySchedules(day, isDisabling, result.reason));
  
        actionObservable.subscribe({
          next: () => {
            const actionText = isDisabling ? 'deshabilitado' : 'habilitado';
            this.snackbar.showSuccess('Éxito', `Día ${day} ${actionText} correctamente`);
          },
          error: (error) => {
            this.snackbar.showError('Error', 'No se pudo actualizar el estado del día');
            console.error('Error updating day status:', error);
          }
        });
      }
    });
  }

  isDayDisabled(day: string, disabledDays: string[]): boolean {
    return disabledDays?.includes(day) || false;
  }

  getDayStatusText(day: string, disabledDays: string[]): string {
    return this.isDayDisabled(day, disabledDays) ? 'Deshabilitado' : 'Habilitado';
  }

  getDayStatusClass(day: string, disabledDays: string[]): string {
    return this.isDayDisabled(day, disabledDays) 
      ? 'bg-red-100 text-red-800' 
      : 'bg-green-100 text-green-800';
  }
}
