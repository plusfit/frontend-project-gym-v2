import { SubRoutine } from '@features/sub-routines/interfaces/sub-routine.interface';

export interface Routine {
  _id: { $oid: string };
  name: string;
  description: string;
  category: string;
  days: number;
  isCustom: boolean;
  subRoutines: SubRoutine[];
  // updatedAt: { $date: string };
  // createdAt: { $date: string };
  __v: number;
}
export interface RoutinePayload {
  name: string;
  description: string;
  category: string;
  days: number;
  isCustom: boolean;
  subRoutines: SubRoutine[];
}
