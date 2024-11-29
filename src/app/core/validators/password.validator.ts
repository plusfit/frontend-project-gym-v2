import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
/**
 * Devuelve una función validadora que verifica si la contraseña cumple con ciertos criterios.
 * @returns {ValidatorFn} Una función de validación.
 */
export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (value?.length < 6)
      return {
        invalidPassword: {
          message: 'La contraseña debe tener al menos 6 caracteres',
        },
      };

    if (!/\d/.test(value)) {
      return {
        invalidPassword: {
          message: 'La contraseña debe tener al menos un número',
        },
      };
    }
    if (!/[a-z]/.test(value)) {
      return {
        invalidPassword: {
          message: 'La contraseña debe tener letras minúsculas',
        },
      };
    }
    if (!/[A-Z]/.test(value)) {
      return {
        invalidPassword: {
          message: 'La contraseña debe tener letras mayúsculas',
        },
      };
    }
    if (!/\W/.test(value)) {
      return {
        invalidPassword: {
          message: 'La contraseña debe tener caracteres especiales',
        },
      };
    }

    return null;
  };
}
