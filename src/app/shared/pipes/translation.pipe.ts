import { Pipe, PipeTransform } from '@angular/core';
//import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'translation',
  standalone: true,
})
export class TranslationPipe implements PipeTransform {
  //constructor(private translateService: TranslateService) {}
  constructor() {}

  transform(value: string): string {
    switch (value) {
      case 'name':
        return 'Nombre';
      case 'lastName':
        return 'Apellido';
      case 'isActive':
        return 'Estado';
      case 'description':
        return 'Descripción';
      case 'mode':
        return 'Modo';
      case 'type':
        return 'Tipo';
      case 'createdAt':
        return 'Creado';
      case 'updatedAt':
        return 'Actualizado';
      case 'category':
        return 'Categoria';
      case 'isCustom':
        return 'Personalizada';
      case 'days':
        return 'Días';
      case 'day':
        return 'Día';
      case 'checkbox':
        return 'Seleccionar';
      default:
        return value;
    }
  }
}
