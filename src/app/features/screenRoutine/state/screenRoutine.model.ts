import { Routine } from '@features/routines/interfaces/routine.interface';

export class ScreenRoutineStateModel {
  loading?: boolean;
  screenRoutines?: Routine[] = [];
}
