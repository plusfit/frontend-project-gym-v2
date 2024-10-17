/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

/**
 * Converts an enum to an array of objects with name and value properties.
 * @param element The enum to convert.
 * @returns An array of objects with name and value properties.
 */
export const enum2Array = (element: any) => {
  return Object.keys(element)
    .filter((value) => isNaN(Number(value)))
    .map((name) => {
      return {
        value: element[name as keyof typeof element],
        name,
      };
    });
};

/**
 * Returns an object with only the keys that have non-null and non-undefined values.
 * @param obj The object to filter.
 * @returns An object with only the keys that have non-null and non-undefined values.
 */
export const notNullKeys = (obj: any) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== null && v !== undefined),
  );
};

/**
 * Returns a boolean value indicating whether an object is empty.
 * @param obj The object to check.
 * @returns A boolean value indicating whether the object is empty.
 */
export const isEmpty = (obj: any) => {
  for (const key in obj) {
    return false;
  }
  return true;
};

/**
 * Returns an object with only the specified properties.
 * @param obj The object to pick properties from.
 * @param props The properties to pick.
 * @returns An object with only the specified properties.
 */
export const pickProperties = (obj: any, ...props: any) => {
  return Object.assign(
    {},
    ...props.map((prop: any) =>
      obj[prop] || Number.isInteger(obj[prop]) ? { [prop]: obj[prop] } : null,
    ),
  );
};

/**
 * Returns a boolean value indicating whether all values in an object are null.
 * @param obj The object to check.
 * @returns A boolean value indicating whether all values in the object are null.
 */
export const allNullValues = (obj: any) => {
  return Object.values(obj).every((value) => !value);
};

/**
 * Returns an array of unique items based on their id property.
 * @param oldArray The old array to merge with the new array.
 * @param newArray The new array to merge with the old array.
 * @returns An array of unique items based on their id property.
 */
export const uniqueArrayItemsById = (oldArray: any, newArray: any) => {
  const all = oldArray ? newArray.concat(oldArray) : newArray;
  return [
    ...all
      .reduce((map: any, obj: any) => map.set(obj.id, obj), new Map())
      .values(),
  ];
};

/**
 * Returns an array of flattened form controls.
 * @param form The form control to flatten.
 * @returns An array of flattened form controls.
 */
export function flattenControls(form: AbstractControl): AbstractControl[] {
  let extracted: AbstractControl[] = [form];
  if (form instanceof FormArray || form instanceof FormGroup) {
    const children = Object.values(form.controls).map(flattenControls);
    extracted = extracted.concat(...children);
  }
  return extracted;
}

/**
 * Adds an id to a route.
 * @param route The route to modify.
 * @param fragment The fragment to search for in the route.
 * @param valueToInsert The value to insert into the route.
 * @returns The modified route.
 */
export function addIdToRoute(
  route: string,
  fragment: string,
  valueToInsert: string,
) {
  if (route.includes(fragment)) {
    const slices = route.split('/');
    return `${slices[0]}/${valueToInsert}/${slices[1]}`;
  }
  return route;
}

/**
 * Updates the validators of a form control based on a boolean value.
 * @param control The form control to update.
 * @param valid A boolean value indicating whether the control should be valid or not.
 */
export function updateValidators(control: FormControl, valid: boolean): void {
  if (valid) {
    control.clearValidators();
  } else {
    control.setValidators(Validators.required);
  }
  control.updateValueAndValidity();
}

export function parseExercises(
  input: string,
): Array<
  | { exerciseName: string; series: number; reps: string }
  | { exerciseName: string; reps: string }
> {
  const exerciseList = input.split('.').filter((e) => e.trim() !== '');

  return exerciseList.map((exerciseString) => {
    //execiseString = 'desde los 2: para adelante y pipe para transformar'
    const shortenedString = exerciseString
      .substring(exerciseString.indexOf(':') + 1)
      .trim();
    const seriesMatch = shortenedString.match(/(\d+) series/);
    const repsMatch =
      shortenedString.match(/de\s(.+?)(\.|$)/) ||
      shortenedString.match(/(\d+)\srep/);

    const series = seriesMatch ? parseInt(seriesMatch[1], 10) : 0;
    const reps = repsMatch ? repsMatch[1] : 'rep'; // Si no hay repeticiones, se pone '' asi no aparece en el panel

    const exerciseName = exerciseString.split(':')[0].trim();

    if (series) {
      // Si series existe y no es 0
      return {
        exerciseName,
        series,
        reps,
      };
    }

    return {
      exerciseName,
      reps,
    };
  });
}
