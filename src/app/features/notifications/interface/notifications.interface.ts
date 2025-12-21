import { NotificationReason, NotificationStatus } from "../enums/notifications.enum";

export class NotificationData {
    _id!: string;
    clientId!: {
        _id: string;
        name: string;
        email: string;
    };
    name!: string;
    reason!: NotificationReason;
    phone!: string;
    status!: NotificationStatus;
    createdAt!: string;
    updatedAt!: string;
}

export interface NotificationApiResponse {
    success: boolean;
    data: NotificationData[];
    total: number;
    page: number;
    pageSize: number;
}
