import { PageScreenRoutine } from '../interfaces/screenRoutine.interface';

export class GetScreenRoutinesByPage {
  static readonly type = '[ScreenRoutine] GetScreenRoutinesByPage';
  constructor(public readonly payload: PageScreenRoutine) {}
}
