import { SubRoutine } from '@features/sub-routines/interfaces/sub-routine.interface';

export interface Routine {
  _id: { $oid: string };
  name: string;
  description: string;
  isCustom: boolean;
  isGeneral: boolean;
  type: string;
  subRoutines: SubRoutine[];
  //TODO: agregar campos de fecha
  // updatedAt: { $date: string };
  // createdAt: { $date: string };
  __v: number;
}
export interface RoutinePayload {
  name: string;
  description: string;
  isCustom: boolean;
  isGeneral: boolean;
  type: string;
  subRoutines: string[];
}

export enum RoutineType {
  MEN = 'men',
  WOMEN = 'women',
  CARDIO = 'cardio',
}
