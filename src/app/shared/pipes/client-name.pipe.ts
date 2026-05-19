import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'clientName',
  standalone: true,
})
export class ClientNamePipe implements PipeTransform {
  transform(value: any): string {
    if (!value) return 'Usuario';

    let nameStr = '';
    if (typeof value === 'string') {
      nameStr = value;
    } else if (typeof value === 'object') {
      nameStr = value.userInfo?.name || value.email || 'Usuario';
    } else {
      nameStr = String(value);
    }

    return this.toTitleCase(nameStr);
  }

  private toTitleCase(value: string): string {
    if (!value) return '';

    // Si es un correo electrónico, lo dejamos en minúsculas por convención.
    if (value.includes('@')) {
      return value.trim().toLowerCase();
    }

    const words = value.trim().toLowerCase().split(/\s+/);
    return words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
