import { Plan } from '@features/plans/interfaces/plan.interface';

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

export class CreatePlan {
  static readonly type = '[User] Create Plan';
  constructor(public readonly plan: Plan) {}
}

export class UpdateSelectedPlan {
  static readonly type = '[Plan] Update Selected Plan';
  constructor(public readonly plan: Plan) {}
}
