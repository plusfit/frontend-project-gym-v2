import { SubRoutine } from '@features/sub-routines/interfaces/sub-routine.interface';

export interface Routine {
  _id: { $oid: string };
  name: string;
  description: string;
  isCustom: boolean;
  isGeneral: boolean;
  showOnScreen: boolean;
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
  showOnScreen: boolean;
  type: string;
  subRoutines: string[];
}

export interface RoutinesApiResponse {
  success: boolean;
  data: RoutineData;
}

export interface RoutinesBySubRoutineApiResponse {
  success: boolean;
  data: Routine[];
}

export interface RoutineApiResponse {
  success: boolean;
  data: Routine;
}

interface RoutineData {
  data: Routine[];
  total: number;
  page: number;
  limit: number;
}

export enum RoutineType {
  MEN = 'men',
  WOMEN = 'women',
  CARDIO = 'cardio',
}
