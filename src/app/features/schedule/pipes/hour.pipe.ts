import { Pipe, PipeTransform } from '@angular/core';
//import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'hourPipe',
  standalone: true,
})
export class HourPipe implements PipeTransform {
  //constructor(private translateService: TranslateService) {}
  constructor() {}

  transform(value: string): string {
    if (!value) {
      return '';
    }

    if (value && parseInt(value) < 12) {
      return `${value} AM`;
    }
    return `${value} PM`;
  }
}
