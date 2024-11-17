export class CreateSchedule {
  static readonly type = '[Schedule] Create Schedule';
  constructor(public readonly payload: any) {}
}

export class GetSchedule {
  static readonly type = '[Schedule] Get Schedule';
}

export class UpdateSchedule {
  static readonly type = '[Schedule] Update Schedule';
  constructor(
    public readonly _id: string,
    public readonly payload: any,
  ) {}
}

export class DeleteHour {
  static readonly type = '[Schedule] Delete Hour';
  constructor(public readonly _id: string) {}
}

export class EditHour {
  static readonly type = '[Schedule] Edit Hour';
  constructor(public readonly payload: any) {}
}

export class GetClientsById {
  static readonly type = '[Schedule] Get Clients';
  constructor(public readonly _id: string) {}
}

export class AssignClient {
  static readonly type = '[Schedule] Assign Client';
  constructor(public readonly payload: any) {}
}

export class DeleteClient {
  static readonly type = '[Schedule] Delete Client';
  constructor(public readonly payload: any) {}
}
