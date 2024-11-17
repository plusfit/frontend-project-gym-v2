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
