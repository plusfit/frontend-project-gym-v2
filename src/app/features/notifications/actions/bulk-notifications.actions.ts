import { BulkStatusResponse } from "../interface/bulk-status.interface";

export class UploadBulkCSV {
    static readonly type = "[BulkNotification] UploadBulkCSV";
    constructor(public readonly file: File) {}
}

export class PollBulkStatus {
    static readonly type = "[BulkNotification] PollBulkStatus";
    constructor(public readonly batchId: string) {}
}

export class ClearBulkStatus {
    static readonly type = "[BulkNotification] ClearBulkStatus";
}

export class SetBulkStatus {
    static readonly type = "[BulkNotification] SetBulkStatus";
    constructor(public readonly status: BulkStatusResponse) {}
}

export class SetBulkError {
    static readonly type = "[BulkNotification] SetBulkError";
    constructor(public readonly error: string) {}
}

export class SetBulkLoading {
    static readonly type = "[BulkNotification] SetBulkLoading";
    constructor(public readonly loading: boolean) {}
}