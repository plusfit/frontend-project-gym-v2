import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routine } from '@features/routines/interfaces/routine.interface';

@Component({
  selector: 'app-organization-detail-routines',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './organization-detail-routines.component.html',
  styleUrl: './organization-detail-routines.component.css',
})
export class OrganizationDetailRoutinesComponent implements OnInit {
  @Input() routines: Routine[] | null = null;

  ngOnInit() {
    // Demo data - remover cuando tengamos datos reales
    if (!this.routines || this.routines.length === 0) {
      this.routines = [
        {
          _id: { $oid: '507f1f77bcf86cd799439011' },
          name: 'Rutina de Fuerza Superior',
          type: 'men',
          description:
            'Rutina enfocada en el desarrollo de fuerza en tren superior, ideal para hombres que buscan incrementar su masa muscular',
          isCustom: true,
          isGeneral: false,
          __v: 0,
          subRoutines: [
            { name: 'Press de banca' },
            { name: 'Dominadas' },
            { name: 'Press militar' },
          ],
        },
        {
          _id: { $oid: '507f1f77bcf86cd799439012' },
          name: 'Cardio Intenso',
          type: 'cardio',
          description: 'Rutina de alta intensidad para quemar grasa',
          isCustom: false,
          isGeneral: true,
          __v: 0,
          subRoutines: [{ name: 'HIIT Básico' }, { name: 'Circuito aeróbico' }],
        },
        {
          _id: { $oid: '507f1f77bcf86cd799439013' },
          name: 'Pilates y Flexibilidad',
          type: 'women',
          description:
            'Rutina de tonificación y flexibilidad especialmente diseñada para mujeres',
          isCustom: true,
          isGeneral: false,
          __v: 0,
          subRoutines: [
            { name: 'Pilates core' },
            { name: 'Estiramientos' },
            { name: 'Yoga básico' },
            { name: 'Tonificación suave' },
          ],
        },
      ] as any as Routine[];
    }
  }

  getRoutineTypeLabel(type: string): string {
    const typeLabels: { [key: string]: string } = {
      men: 'Hombres',
      women: 'Mujeres',
      cardio: 'Cardio',
    };
    return typeLabels[type] || type;
  }

  getRoutineTypeColor(type: string): string {
    const typeColors: { [key: string]: string } = {
      men: 'bg-blue-100 text-blue-800',
      women: 'bg-pink-100 text-pink-800',
      cardio: 'bg-red-100 text-red-800',
    };
    return typeColors[type] || 'bg-gray-100 text-gray-800';
  }

  getRoutineId(routine: Routine): string {
    return routine._id?.$oid || routine._id?.toString() || 'N/A';
  }

  trackByRoutineId = (index: number, routine: Routine): string => {
    return routine._id?.$oid || routine._id?.toString() || `routine-${index}`;
  };

  getSubRoutinesPreview(routine: Routine): string {
    if (!routine.subRoutines || routine.subRoutines.length === 0) {
      return 'Sin sub-rutinas';
    }

    const preview = routine.subRoutines
      .slice(0, 2)
      .map((sr) => sr.name || 'Sin nombre')
      .join(', ');

    return routine.subRoutines.length > 2 ? `${preview}...` : preview;
  }

  hasMoreSubRoutines(routine: Routine): boolean {
    return routine.subRoutines ? routine.subRoutines.length > 2 : false;
  }

  getCustomLabel(routine: Routine): string {
    return routine.isCustom ? 'Personalizada' : 'Estándar';
  }

  getCustomClasses(routine: Routine): string {
    return routine.isCustom
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  }

  getGeneralLabel(routine: Routine): string {
    return routine.isGeneral ? 'General' : 'Específica';
  }

  getGeneralClasses(routine: Routine): string {
    return routine.isGeneral
      ? 'bg-blue-100 text-blue-800'
      : 'bg-gray-100 text-gray-800';
  }

  getDescription(routine: Routine): string {
    return routine.description || 'Sin descripción disponible';
  }

  getDescriptionTitle(routine: Routine): string {
    return routine.description || 'Sin descripción disponible';
  }
}
