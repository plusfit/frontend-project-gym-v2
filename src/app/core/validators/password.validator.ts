import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
/**
 * Returns a validator function that checks if the password meets certain criteria.
 * @returns {ValidatorFn} A validator function.
 */
export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (value?.length < 6)
      return {
        invalidPassword: {
          message: 'Password must be at least 6 characters long',
        },
      };

    if (!/\d/.test(value)) {
      return {
        invalidPassword: {
          message: 'The password must have a number',
        },
      };
    }
    if (!/[a-z]/.test(value)) {
      return {
        invalidPassword: {
          message: 'The password must have lowercase characters',
        },
      };
    }
    if (!/[A-Z]/.test(value)) {
      return {
        invalidPassword: {
          message: 'The password must have uppercase characters',
        },
      };
    }
    if (!/\W/.test(value)) {
      return {
        invalidPassword: {
          message: 'The password must have special characters',
        },
      };
    }

    return null;
  };
}
