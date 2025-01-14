import { AuthCredentials } from '@features/auth/interfaces/auth';
import { PageClient } from '../interface/filters.clients.interface';

export class GetClients {
  static readonly type = '[Client] GetClients';
  constructor(public readonly payload: PageClient) {}
}

export class DeleteClient {
  static readonly type = '[Client] DeleteClient';
  constructor(public readonly id: string) {}
}

export class RegisterClient {
  static readonly type = '[Client] RegisterClient';
  constructor(public readonly payload: AuthCredentials) {}
}
