import { Exercise } from '../interfaces/exercise.interface';
import {
  FiltersExercise,
  PageExercise,
} from '../interfaces/filters.excersise.interface';

export class ExerciseStateModel {
  loading?: boolean;
  exercises?: Exercise[];
  page?: PageExercise | null;
  filters?: FiltersExercise | null;
  totalExercises?: number;
}
