import { WhatsAppConnectionStatus } from "../interface/whatsapp-status.interface";

/** How a WhatsApp session status reads on screen, wherever it is shown. */
export interface WhatsAppStatusDescriptor {
    /** Short enough for a status pill. */
    label: string;
    /** One sentence telling the admin what the status means for the send. */
    description: string;
    /** Shared vocabulary between the status pill and the page status card. */
    cssClass: "connected" | "pending" | "error" | "disconnected";
}

const UNKNOWN_STATUS: WhatsAppStatusDescriptor = {
    label: "Estado desconocido",
    description: "No pudimos interpretar el estado de la sesión. Actualizá la página.",
    cssClass: "disconnected",
};

const STATUS_DESCRIPTORS: Record<WhatsAppConnectionStatus, WhatsAppStatusDescriptor> = {
    [WhatsAppConnectionStatus.CONNECTED]: {
        label: "Conectado",
        description: "Listo para elegir destinatarios y enviar el mensaje.",
        cssClass: "connected",
    },
    [WhatsAppConnectionStatus.CONNECTING]: {
        label: "Preparando conexión",
        description: "Estamos abriendo la sesión de WhatsApp.",
        cssClass: "pending",
    },
    [WhatsAppConnectionStatus.QR_READY]: {
        label: "QR listo para escanear",
        description: "Escaneá el código desde WhatsApp para vincular el dispositivo.",
        cssClass: "pending",
    },
    [WhatsAppConnectionStatus.INITIALIZING]: {
        label: "Preparando QR",
        description: "Estamos leyendo el estado actual antes de habilitar el flujo correcto.",
        cssClass: "pending",
    },
    [WhatsAppConnectionStatus.ERROR]: {
        label: "Error",
        description: "Revisá la conexión de WhatsApp o intentá nuevamente.",
        cssClass: "error",
    },
    [WhatsAppConnectionStatus.DISCONNECTED]: {
        label: "Desconectado",
        description: "Conectá WhatsApp para habilitar el envío masivo.",
        cssClass: "disconnected",
    },
};

/**
 * The one reading of a session status.
 *
 * The connection panel and the bulk send page both narrate the same session, so
 * they must narrate it identically: two switch statements drifted apart once and
 * left the pill and the card disagreeing on what was happening.
 *
 * Accepts a raw string because the status arrives from the backend and is only
 * assumed to belong to the enum.
 */
export const describeWhatsAppStatus = (
    status: WhatsAppConnectionStatus | string | null | undefined,
): WhatsAppStatusDescriptor => {
    const normalized = String(status ?? "").toLowerCase() as WhatsAppConnectionStatus;

    return STATUS_DESCRIPTORS[normalized] ?? UNKNOWN_STATUS;
};
