import { Settings, SettingsUpdate } from '../interfaces/settings.interface';

export class CrateSettings {
  static readonly type = '[Settings] Create Settings';
  constructor(public readonly payload: Settings) {}
}

export class GetSettings {
  static readonly type = '[Settings] Get Settings';
}

export class UpdateSettings {
  static readonly type = '[Settings] Update Settings';
  constructor(
    public readonly _id: string,
    public readonly payload: SettingsUpdate,
  ) {}
}
