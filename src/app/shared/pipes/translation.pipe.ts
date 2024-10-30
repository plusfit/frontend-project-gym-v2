import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'translation',
})
export class TranslationPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(value: string): string {
    switch (value) {
      case 'name':
        return this.translateService.instant('Nombre');
      case 'lastName':
        return this.translateService.instant('Apellido');
      case 'isActive':
        return this.translateService.instant('Estado');
      default:
        return value;
    }
  }
}
