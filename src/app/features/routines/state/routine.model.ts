import { SubRoutine } from '@features/sub-routines/interfaces/sub-routine.interface';
import { environment } from '../../../../environments/environment.prod';
import {
  FiltersRoutine,
  PageRoutine,
} from '../interfaces/filters.routine.interface';
import { Routine } from '../interfaces/routine.interface';

export class RoutineStateModel {
  loading?: boolean;
  routines?: Routine[] = [];
  affectedRoutines?: Routine[] = [];
  page?: PageRoutine | null;
  limit: number = environment.routineTableLimit;
  filters?: FiltersRoutine | null;
  totalRoutines?: number;
  selectedRoutine?: Routine | null;
  subRoutines?: SubRoutine[] = [];
}
