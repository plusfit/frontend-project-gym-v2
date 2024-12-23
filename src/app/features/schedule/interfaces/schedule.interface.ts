export interface IHour {
  startTime: string;
  endTime: string;
  maxCount: number;
  clients: string[];
}

export interface ISchedule {
  _id: string;
  name: string;
  hours: IHour[];
}

export interface IScheduleResponse {
  data: ISchedule[];
  success: boolean;
}

export interface PageScheduleClient {
  limit: number;
  page: number;
  filtersInformation: FilterClientsSchedule;
}

export interface FilterClientsSchedule {
  email: string;
}
