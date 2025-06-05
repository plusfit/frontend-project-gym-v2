export interface Settings {
  schedule: Hour[];
}

export interface Hour {
  day: string;
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
