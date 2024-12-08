import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

const ERROR_MESSAGES: Record<string, string> = {
  unknown: 'El campo es inválido',
  required: 'El campo es obligatorio',
};

export type FieldValidationErrorMessages =
  | {
      [field: string]: ValidationErrorMessages;
    }
  | undefined;

export type ValidationErrorMessages = {
  [error: string]: string;
};

@Pipe({
  name: 'validationErrors',
  standalone: true,
})
export class ValidationErrorsPipe implements PipeTransform {
  transform(
    errors: ValidationErrors | null | undefined,
    customMessages?: ValidationErrorMessages,
  ): string {
    return errors
      ? Object.entries(errors)
          .map(([key, value]) =>
            typeof value === 'string' && value.length > 0
              ? // if the value is a string, it is considered the error message itself
                value
              : value === true
                ? // check if there are any custom error messages
                  customMessages && customMessages[key]
                  ? customMessages[key]
                  : // return default error messages
                    ERROR_MESSAGES[key]
                    ? ERROR_MESSAGES[key]
                    : ERROR_MESSAGES['unknown']
                : // if `value` is neither true nor a string, it is considered an unknown error
                  ERROR_MESSAGES['unknown'],
          )
          .join('. ')
      : '';
  }
}
