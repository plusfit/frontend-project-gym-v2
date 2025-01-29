import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'camelToTitle',
  standalone: true,
})
export class CamelToTitlePipe implements PipeTransform {
  transform(value: string): string {
    if (value.includes('.')) {
      value = value.split('.')[1];
    }
    // Split the string into words based on capital letters
    const words = value.replace(/([A-Z])/g, ' $1').split(' ');

    // Capitalize the first letter of each word and join them back together
    return words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
