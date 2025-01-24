import { EDay } from '@core/enums/day.enum';
import { Exercise } from '@features/exercises/interfaces/exercise.interface';

export interface SubRoutine {
  _id?: string;
  name: string;
  isCustom: boolean;
  exercises: Exercise[];
  day: EDay;
  category: string;
}

export interface SubRoutineApiResponse {
  success: boolean;
  data: SubRoutineData;
}

interface SubRoutineData {
  data: SubRoutine[];
  total: number;
  page: number;
  limit: number;
}
