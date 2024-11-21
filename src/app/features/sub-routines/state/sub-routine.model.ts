import { HttpErrorResponse } from '@angular/common/http';
import { SubRoutine } from '../interfaces/sub-routine.interface';

export class SubRoutineStateModel {
  subRoutines?: SubRoutine[] | null;
  selectedSubRoutine?: SubRoutine | null;
  loading?: boolean | null;
  total?: number | null;
  error?: HttpErrorResponse | null;
  currentPage?: number | null;
  pageSize?: number | null;
  pageCount?: number | null;
}
