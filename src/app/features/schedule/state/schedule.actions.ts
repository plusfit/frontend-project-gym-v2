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
  constructor(
    public readonly _id: string,
    public readonly schedule: any,
  ) {}
}

export class GetClientsById {
  static readonly type = '[Schedule] Get Clients';
  constructor(public readonly _id: string) {}
}

export class AssignClient {
  static readonly type = '[Schedule] Assign Client';
  constructor(
    public readonly _id: string,
    public readonly clients: string[],
  ) {}
}

export class DeleteClient {
  static readonly type = '[Schedule] Delete Client';
  constructor(
    public readonly _id: string,
    public readonly client: string,
  ) {}
}

export class getClientsAssignable {
  static readonly type = '[Schedule] Get Clients Assignable';
  constructor(
    public readonly payload: {
      page: number;
      pageSize: number;
      searchQ?: string;
      hourId?: string;
    },
  ) {}
}

export class postClientsArray {
  static readonly type = '[Schedule] Get Clients Array';
  constructor(public readonly ids: string[]) {}
}

export class ClearClients {
  static readonly type = '[Schedule] Clear Clients';
}

export class getMaxCount {
  static readonly type = '[Schedule] Get Max Count';
  constructor(public readonly _id: string) {}
}

export class SelectedClient {
  static readonly type = '[Schedule] Selected Client';
  constructor(public readonly client: any) {}
}

export class ClearSelectedClient {
  static readonly type = '[Schedule] Clear Selected Client';
}

export class GetDisabledDays {
  static readonly type = '[Schedule] Get Disabled Days';
}

export class SetDisabledDays {
  static readonly type = '[Schedule] Set Disabled Days';
  constructor(public readonly disabledDays: string[]) {}
}

export class ToggleDayStatus {
  static readonly type = '[Schedule] Toggle Day Status';
  constructor(
    public readonly day: string,
    public readonly reason?: string
  ) {}
}

export class ToggleScheduleDisabled {
  static readonly type = '[Schedule] Toggle Schedule Disabled';
  constructor(
    public readonly scheduleId: string, 
    public readonly disabled: boolean
  ) {}
}

export class ToggleAllDaySchedules {
  static readonly type = '[Schedule] Toggle All Day Schedules';
  constructor(
    public readonly day: string,
    public readonly disabled: boolean,
    public readonly reason?: string
  ) {}
}
