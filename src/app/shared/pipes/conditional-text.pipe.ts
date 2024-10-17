import { Pipe, PipeTransform } from '@angular/core';

/**
 * Display one text or another based on value.
 * @param {value} boolean - Value to evaluate
 * @param {args} string - Texts to be displayed
 * @returns {string}
 * @example
 */
@Pipe({
  name: 'conditionalText',
  standalone: true,
})
export class ConditionalTextPipe implements PipeTransform {
  transform(value: boolean | null, ...args: string[]): string {
    return value ? args[0] : args[1];
  }
}
