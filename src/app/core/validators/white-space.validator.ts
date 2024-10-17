import { AbstractControl } from '@angular/forms';
/**
 * Returns a validator function that checks if the input contains whitespace characters.
 * @param {AbstractControl} control  The form control to validate.
 * @returns A validation error object if the input contains whitespace characters, otherwise null.
 */
export function whiteSpaceValidator(control: AbstractControl): unknown {
  if (
    !!control &&
    (control.value as string) &&
    control.value.trim().length === 0
  ) {
    return {
      whiteSpace: {
        message: 'Whitespaces not allowed',
      },
    };
  }
  return null;
}
