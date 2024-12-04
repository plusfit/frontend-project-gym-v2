import { Pipe, PipeTransform } from '@angular/core';
import { EDay } from '@core/enums/day.enum';

@Pipe({
  name: 'dayTranslate',
  standalone: true,
})
export class DayTranslatePipe implements PipeTransform {
  private dayTranslations: { [key in EDay]: string } = {
    [EDay.MONDAY]: 'Lunes',
    [EDay.TUESDAY]: 'Martes',
    [EDay.WEDNESDAY]: 'Miércoles',
    [EDay.THURSDAY]: 'Jueves',
    [EDay.FRIDAY]: 'Viernes',
    [EDay.SATURDAY]: 'Sábado',
    [EDay.SUNDAY]: 'Domingo',
  };

  transform(day: EDay): string | EDay {
    return this.dayTranslations[day];
  }
}
