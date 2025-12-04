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

export interface InvitationCode {
  code: string;
  link: string;
}

export interface InvitationCodeResponse {
  success: boolean;
  data: InvitationCode;
}
