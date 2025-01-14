import { HttpErrorResponse } from '@angular/common/http';
import { Plan } from '@features/plans/interfaces/plan.interface';

export class PlanStateModel {
  plans?: Plan[];
  selectedPlan?: Plan | null;
  loading?: boolean;
  total?: number;
  error?: HttpErrorResponse | null;
  currentPage?: number | null;
  pageSize?: number | null;
  pageCount?: number | null;
}
