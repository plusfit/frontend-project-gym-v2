import { EDay } from '@core/enums/day.enum';

export interface SubRoutine {
  _id?: string;
  name: string;
  isCustom: boolean;
  exercises: string[];
  day: EDay;
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
