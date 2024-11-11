import { Settings } from '../interfaces/settings.interface';

export class SettingsStateModel {
  loading?: boolean;
  settings?: Settings | null;
}
