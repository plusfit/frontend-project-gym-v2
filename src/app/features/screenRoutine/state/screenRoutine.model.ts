import { ScreenRoutine } from '../interfaces/screenRoutine.interface';

export class ScreenRoutineStateModel {
  loading?: boolean;
  screenRoutines?: ScreenRoutine[] = [];
}
