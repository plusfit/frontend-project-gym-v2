import { NotificationReason, NotificationStatus } from "../enums/notifications.enum";

export interface FiltersNotification {
    name?: string;
    status?: NotificationStatus;
    reason?: NotificationReason;
}

export interface PageNotification {
    page: number;
    pageSize: number;
    searchQ?: string;
    status?: NotificationStatus | "";
}
