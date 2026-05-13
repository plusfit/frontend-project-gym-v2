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