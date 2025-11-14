import { AuthCredentials } from "@features/auth/interfaces/auth";
import { PageClient } from "../interface/filters.clients.interface";

export class GetClients {
  static readonly type = "[Client] GetClients";
  constructor(public readonly payload: PageClient) {}
}

export class GetClientById {
  static readonly type = "[Client] GetClientById";
  constructor(public readonly id: string) {}
}

export class RegisterClient {
  static readonly type = "[Client] RegisterClient";
  constructor(public readonly payload: AuthCredentials) {}
}

export class CreateClient {
  static readonly type = "[Client] createClient";
  constructor(public readonly payload: any) {}
}

export class UpdateClient {
  static readonly type = "[Client] UpdateClient";
  constructor(
    public readonly id: string,
    public readonly payload: any,
  ) {}
}
export class DeleteClient {
  static readonly type = "[Client] DeleteClient";
  constructor(public readonly id: string) {}
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class RoutineClient {
  static readonly type = "[Client] RoutineClient";
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class PlanClient {
  static readonly type = "[Client] PlanClient";
}

export class ToggleDisabledClient {
  static readonly type = "[Client] ToggleDisabledClient";
  constructor(
    public readonly id: string,
    public disabled: boolean,
  ) {}
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class GetActiveClientsCount {
  static readonly type = "[Client] GetActiveClientsCount";
}

export class GetUserPassword {
  static readonly type = "[Client] GetUserPassword";
  constructor(
    public readonly clientId: string,
    public readonly adminCode: string,
  ) {}
}

export const ClearUserPassword = {
  type: "[Client] ClearUserPassword",
};

export class SendForgotPassword {
  static readonly type = "[Client] SendForgotPassword";
  constructor(public readonly clientId: string) {}
}

export class AddAvailableDays {
  static readonly type = "[Client] AddAvailableDays";
  constructor(
    public readonly clientId: string,
    public readonly daysToAdd: number,
  ) {}
}

export class UpdateAvailableDays {
  static readonly type = "[Client] UpdateAvailableDays";
  constructor(
    public readonly clientId: string,
    public readonly availableDays: number,
  ) {}
}

export class ValidateCI {
  static readonly type = "[Client] ValidateCI";
  constructor(public readonly ci: string) {}
}

