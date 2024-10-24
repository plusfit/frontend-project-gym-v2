export interface Settings {
  day: string;
  hours: number[];
  maxCount: number;
}

export interface SettingsResponse {
  data: Settings;
  success: boolean;
}
