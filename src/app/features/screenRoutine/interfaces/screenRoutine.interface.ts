export interface ScreenRoutine {
  routines: string[];
}

export interface PageScreenRoutine {
  page: number;
  limit: number;
  isGeneral?: boolean;
}
