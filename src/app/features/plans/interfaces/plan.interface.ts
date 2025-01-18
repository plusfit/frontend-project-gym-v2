import { Routine } from '@features/routines/interfaces/routine.interface';

export interface Plan {
  _id: string;
  name: string;
  type: string;
  defaultRoutine: Routine;
  days: number;
  updatedAt: Date;
  createdAt: Date;
}

export interface PlanApiResponse {
  success: boolean;
  data: PlanData;
}

interface PlanData {
  data: Plan[];
  total: number;
  page: number;
  limit: number;
}
