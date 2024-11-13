import { environment } from '../../../../environments/environment.prod';
import { Exercise } from '../interfaces/exercise.interface';
import {
  FiltersExercise,
  PageExercise,
} from '../interfaces/filters.excersise.interface';

export class ExerciseStateModel {
  loading?: boolean;
  exercises?: Exercise[] = [];
  page?: PageExercise | null;
  limit: number = environment.exerciseTableLimit;
  filters?: FiltersExercise | null;
  totalExercises?: number;
  exerciseEditing?: Exercise | null;
}
