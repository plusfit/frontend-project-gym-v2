import { PageClient } from '../interface/filters.clients.interface';

export class GetClients {
  static readonly type = '[Client] GetClients';
  constructor(public readonly payload: PageClient) {}
}

export class DeleteClient {
  static readonly type = '[Client] DeleteClient';
  constructor(public readonly id: string) {}
}
