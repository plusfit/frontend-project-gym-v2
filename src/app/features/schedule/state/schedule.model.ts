export class ScheduleStateModel {
  loading?: boolean;
  loadingAssignable?: boolean;
  loadingHour?: boolean;
  schedule?: any | null;
  clients?: any | null;
  clientsAssignable?: any | null;
  maxCount?: number;
  limit?: number;
  total?: number;
  currentPage?: number | null;
  pageCount?: number | null;
  pageSize?: number | null;
  error?: any | null;
}
