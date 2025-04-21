import { ExercisePayload } from '../interfaces/exercise.interface';
import {
  FiltersExercise,
  PageExercise,
} from '../interfaces/filters.excersise.interface';

export class GetExercisesByPage {
  static readonly type = '[Exercise] GetExercisesByPage';
  constructor(public readonly payload: PageExercise) {}
}
export class GetExercisesByName {
  static readonly type = '[Exercise] GetExercisesByName';
  constructor(
    public readonly pageInformation: PageExercise,
    public readonly filtersInformation: FiltersExercise,
  ) {}
}
export class CreateExercise {
  static readonly type = '[Exercise] CreateExercise';
  constructor(public readonly payload: ExercisePayload) {}
}
export class DeleteExercise {
  static readonly type = '[Exercise] DeleteExercise';
  constructor(
    public readonly id: string,
    public readonly imagePath: string,
  ) {}
}
export class GetExerciseById {
  static readonly type = '[Exercise] GetExerciseById';
  constructor(public readonly id: string) {}
}
export class SetLimitPerPage {
  static readonly type = '[Exercise] SetLimitPerPage';
  constructor(public readonly limit: number) {}
}
export class UpdateExercise {
  static readonly type = '[Exercise] UpdateExercise';
  constructor(
    public readonly payload: ExercisePayload,
    public readonly id: string,
  ) {}
}

export class GetFileUrl {
  static readonly type = '[Orders] Get Avatar Url';
  constructor(public readonly refs: any) {}
}

export class saveExcercisesFiles {
  static readonly type = '[Orders] Save Order Files';
  constructor(public readonly payload: File) {}
}

export class GetCategories {
  static readonly type = '[Exercise] GetCategories';
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly name?: string,
  ) {}
}
