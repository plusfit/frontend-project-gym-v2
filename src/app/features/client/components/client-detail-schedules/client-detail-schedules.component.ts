import { AsyncPipe, NgClass, KeyValuePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ClientsState } from '@features/client/state/clients.state';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';

@Component({
    selector: 'app-client-detail-schedules',
    standalone: true,
    imports: [AsyncPipe, LoaderComponent, NgClass, KeyValuePipe],
    templateUrl: './client-detail-schedules.component.html',
    styleUrl: './client-detail-schedules.component.css',
})
export class ClientDetailSchedulesComponent implements OnInit {
    clientInfo$: Observable<any> | undefined;

    // Mapeo de días en español para ordenar
    dayOrder: { [key: string]: number } = {
        'lunes': 1,
        'martes': 2,
        'miércoles': 3,
        'jueves': 4,
        'viernes': 5,
        'sábado': 6,
        'domingo': 7
    };

    constructor(private store: Store) { }

    ngOnInit(): void {
        this.clientInfo$ = this.store.select(ClientsState.getSelectedClient);
    }

    /**
     * Obtiene las entradas del objeto schedules ordenadas por día de la semana
     */
    getSortedSchedules(schedules: { [key: string]: string }): Array<{ key: string; value: string }> {
        return Object.entries(schedules)
            .sort((a, b) => {
                const orderA = this.dayOrder[a[0].toLowerCase()] || 999;
                const orderB = this.dayOrder[b[0].toLowerCase()] || 999;
                return orderA - orderB;
            })
            .map(([key, value]) => ({ key, value }));
    }

    /**
     * Formatea el horario de "20-21" a "De 20 a 21 hrs"
     * Si hay múltiples horarios separados por coma, devuelve un array
     */
    formatSchedule(schedule: string): string[] {
        // Si hay múltiples horarios separados por coma
        if (schedule.includes(',')) {
            const schedules = schedule.split(',').map(s => s.trim());
            return schedules.map(s => {
                const parts = s.split('-');
                if (parts.length === 2) {
                    return `${parts[0]} a ${parts[1]} hrs`;
                }
                return s;
            });
        }

        // Si es un solo horario
        const parts = schedule.split('-');
        if (parts.length === 2) {
            return [`${parts[0]} a ${parts[1]} hrs`];
        }
        return [schedule];
    }

    protected readonly Object = Object;
}
