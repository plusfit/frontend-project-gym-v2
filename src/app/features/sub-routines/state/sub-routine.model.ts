import { HttpErrorResponse } from '@angular/common/http';
import { SubRoutine } from '../interfaces/sub-routine.interface';

export class SubRoutineStateModel {
  subRoutines?: SubRoutine[];
  selectedSubRoutine?: SubRoutine | null;
  loading?: boolean;
  total?: number;
  error?: HttpErrorResponse | null;
  currentPage?: number | null;
  pageSize?: number | null;
  pageCount?: number | null;
}
