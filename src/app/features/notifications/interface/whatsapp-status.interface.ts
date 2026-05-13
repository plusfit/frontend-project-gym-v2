export enum WhatsAppConnectionStatus {
    INITIALIZING = "initializing",
    CONNECTING = "connecting",
    CONNECTED = "connected",
    DISCONNECTED = "disconnected",
    QR_READY = "qr_ready",
    ERROR = "error",
}

export interface WhatsAppStatusResponse {
    status: WhatsAppConnectionStatus;
    isConnected: boolean;
    error?: string;
}

export interface WhatsAppStatusApiResponse {
    success: boolean;
    data: WhatsAppStatusResponse;
}

export interface WhatsAppQrResponse {
    qr?: string;
    error?: string;
}