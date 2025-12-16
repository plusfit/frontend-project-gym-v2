import { PageNotification } from "../interface/filters.notifications.interface";

export class GetNotifications {
    static readonly type = "[Notification] GetNotifications";
    constructor(public readonly payload: PageNotification) { }
}

export class GetNotificationById {
    static readonly type = "[Notification] GetNotificationById";
    constructor(public readonly id: string) { }
}

export class UpdateNotificationStatus {
    static readonly type = "[Notification] UpdateNotificationStatus";
    constructor(
        public readonly id: string,
        public readonly status: string,
    ) { }
}

export class DeleteNotification {
    static readonly type = "[Notification] DeleteNotification";
    constructor(public readonly id: string) { }
}
