import { Plan } from '@features/plans/interfaces/plan.interface';
import {GetClientsById} from "@features/schedule/state/schedule.actions";

export class GetPlans {
  static readonly type = '[Plan] Get Plans';
  constructor(
    public readonly payload: {
      page: number;
      pageSize: number;
      searchQ?: string;
    },
  ) {}
}

export class GetPlan {
  static readonly type = '[Plan] Get Plan';
  constructor(public readonly id: string) {}
}

export class SetSelectedPlan {
  static readonly type = '[Plan] Set Selected Plan';
  constructor(public readonly plan: Plan | null) {}
}

export class SetPlans {
  static readonly type = '[Plan] Set Plans';
  constructor(public readonly plans: Plan[]) {}
}

export class UpdatePlan {
  static readonly type = '[Plan] Update Plan';
  constructor(
    public readonly id: string,
    public readonly plan: Plan,
  ) {}
}

export class DeletePlan {
  static readonly type = '[Plan] Delete Plan';
  constructor(public readonly id: string) {}
}

export class GetClientsByPlanId {
  static readonly type = '[Plan] Get Clients By Plan Id';
  constructor(public readonly planId: string) {}
}

export class CreatePlan {
  static readonly type = '[User] Create Plan';
  constructor(public readonly plan: Plan) {}
}

export class UpdateSelectedPlan {
  static readonly type = '[Plan] Update Selected Plan';
  constructor(public readonly plan: Plan) {}
}
