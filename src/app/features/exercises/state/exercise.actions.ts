import { PageExercise } from '../interfaces/filters.excersise.interface';

export class GetExercisesByPage {
  static readonly type = '[Exercise] GetExercisesByPage';
  constructor(public readonly payload: PageExercise) {}
}
