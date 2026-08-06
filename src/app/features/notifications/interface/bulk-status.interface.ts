export enum BulkStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
}

export interface BulkStatusResponse {
    batchId: string;
    status: BulkStatus;
    totalRows: number;
    processedRows: number;
    successCount: number;
    failureCount: number;
}

export interface BulkUploadResponse {
    batchId: string;
    total: number;
}

export interface ApiEnvelope<T> {
    success: boolean;
    data: T;
}

/** Why a selected client did not make it into the batch. */
export type BulkSendSkipReason =
    | "not_found"
    | "no_phone"
    | "invalid_phone"
    | "duplicate_phone";

export interface BulkSendSkipped {
    clientId: string;
    name: string | null;
    reason: BulkSendSkipReason;
}

/** Result of the file-less bulk send. */
export interface BulkSendResponse {
    batchId: string;
    /** Recipients actually enqueued. */
    total: number;
    /** Clients selected, so the dialog can show selected vs sent. */
    requested: number;
    skipped: BulkSendSkipped[];
}