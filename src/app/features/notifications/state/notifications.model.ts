import { NotificationData } from "../interface/notifications.interface";
import { FiltersNotification, PageNotification } from "../interface/filters.notifications.interface";

export class NotificationsStateModel {
  loading?: boolean;
  notifications?: NotificationData[];
  page?: PageNotification | null;
  filters?: FiltersNotification | null;
  selectedNotification?: NotificationData;
  total?: number;
  error?: any;
  currentPage?: number;
  pageSize?: number;
  pageCount?: number;
}
