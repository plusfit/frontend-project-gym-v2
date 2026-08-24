import { WhatsAppConnectionStatus } from "../interface/whatsapp-status.interface";
import { describeWhatsAppStatus } from "./whatsapp-status.util";

/**
 * The connection panel and the bulk send page used to each map the status with
 * their own switch. They drifted, so the pill and the card could describe the
 * same session differently. One mapping, one reading.
 */
describe("describeWhatsAppStatus", () => {
    it("describes a connected session as ready to send", () => {
        const descriptor = describeWhatsAppStatus(WhatsAppConnectionStatus.CONNECTED);

        expect(descriptor.label).toBe("Conectado");
        expect(descriptor.cssClass).toBe("connected");
        expect(descriptor.description).toContain("Listo para elegir destinatarios");
    });

    it("groups every in-between status under the same pending styling", () => {
        const pendingStatuses = [
            WhatsAppConnectionStatus.CONNECTING,
            WhatsAppConnectionStatus.QR_READY,
            WhatsAppConnectionStatus.INITIALIZING,
        ];

        for (const status of pendingStatuses) {
            expect(describeWhatsAppStatus(status).cssClass)
                .withContext(status)
                .toBe("pending");
        }
    });

    it("separates a failed session from a merely closed one", () => {
        expect(describeWhatsAppStatus(WhatsAppConnectionStatus.ERROR).cssClass).toBe("error");
        expect(describeWhatsAppStatus(WhatsAppConnectionStatus.DISCONNECTED).cssClass).toBe(
            "disconnected",
        );
    });

    /** The status is whatever the backend sent; the enum is only an assumption. */
    it("reads a raw backend string in any casing", () => {
        expect(describeWhatsAppStatus("QR_READY").label).toBe("QR listo para escanear");
    });

    it("falls back to an unknown state instead of rendering nothing", () => {
        for (const status of ["", null, undefined, "something-else"]) {
            const descriptor = describeWhatsAppStatus(status);

            expect(descriptor.label).withContext(String(status)).toBe("Estado desconocido");
            expect(descriptor.description).withContext(String(status)).not.toBe("");
        }
    });
});
