import { Injectable } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { IValidatorsErrors } from '../interfaces/validator_errors.interface';

/**
 * The ValidatorMessage service provides error messages for form validation errors.
 */
@Injectable({
  providedIn: 'root',
})
export class ValidatorMessage {
  /**
   * The default error messages for validation errors.
   */
  errorsDesc: IValidatorsErrors = {
    required: 'This field is required',
    email: 'Invalid email',
    max: 'This number is higher than allowed',
    min: 'This number is less than allowed',
    maxlength: 'This text is higher than allowed',
    minlength: 'This text is less than allowed',
    pattern: 'This text does not match the defined pattern',
  };

  /**
   * A guard that checks if the user is authenticated before allowing access to a route.
   * @returns A boolean indicating whether the user is authenticated or not.
   */
  getErrorDescObj(): IValidatorsErrors {
    return this.errorsDesc;
  }

  /**
   * Returns the first error message from a list of validation errors.
   * @param {ValidationErrors} errors The list of validation errors.
   * @returns The first error message from the list of validation errors.
   */
  getFirstErrorMessage(errors: ValidationErrors): IValidatorsErrors {
    const firstKey: keyof IValidatorsErrors =
      (Object.keys(errors)[0] as keyof IValidatorsErrors) || '';

    return this.errorsDesc[firstKey] ?? Object.values(errors)[0].message;
  }
}
