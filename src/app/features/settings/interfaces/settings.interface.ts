export interface Settings {
  days: string;
  hours: number[];
  maxCount: number;
}

export interface SettingsUpdate {
  schedule: Settings;
}

export interface SettingsResponse {
  data: Settings;
  success: boolean;
}
