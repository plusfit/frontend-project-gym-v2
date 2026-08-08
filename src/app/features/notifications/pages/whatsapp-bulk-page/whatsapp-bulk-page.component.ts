import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { BulkSendComponent } from "../../components/bulk-send/bulk-send.component";
import { WhatsAppConnectionComponent } from "../../components/whatsapp-connection/whatsapp-connection.component";
import {
    WhatsAppConnectionStatus,
    WhatsAppStatusResponse,
} from "../../interface/whatsapp-status.interface";
import { NotificationService } from "../../services/notification.service";

export interface WhatsappBulkPageState {
    status: WhatsAppConnectionStatus;
    isConnected: boolean;
    loading: boolean;
    disconnecting?: boolean;
    error?: string;
}

/**
 * WhatsApp bulk send, as a route rather than a modal.
 *
 * The flow spans four steps, a live message preview and a batch that trickles
 * out over minutes to avoid WhatsApp's spam heuristics. A dialog could not
 * survive a refresh, could not be linked to, and gave the composer a cramped
 * viewport it had outgrown.
 */
@Component({
    selector: "app-whatsapp-bulk-page",
    standalone: true,
    imports: [WhatsAppConnectionComponent, BulkSendComponent],
    templateUrl: "./whatsapp-bulk-page.component.html",
    styleUrls: ["./whatsapp-bulk-page.component.css"],
})
export class WhatsappBulkPageComponent implements OnInit, OnDestroy {
    readonly WhatsAppConnectionStatus = WhatsAppConnectionStatus;

    state: WhatsappBulkPageState = {
        status: WhatsAppConnectionStatus.INITIALIZING,
        isConnected: false,
        loading: true,
    };

    private destroy$ = new Subject<void>();

    constructor(
        private notificationService: NotificationService,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.loadWhatsAppStatus();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    goBack(): void {
        this.router.navigate(["/notificaciones"]);
    }

    onStatusChange(status: WhatsAppStatusResponse): void {
        this.applyStatus(status);
    }

    disconnectWhatsApp(): void {
        if (this.state.disconnecting) return;

        this.state = {
            ...this.state,
            disconnecting: true,
            error: undefined,
        };

        this.notificationService
            .logoutWhatsApp()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.state = {
                        status: WhatsAppConnectionStatus.DISCONNECTED,
                        isConnected: false,
                        loading: false,
                        disconnecting: false,
                    };
                },
                error: () => {
                    this.state = {
                        ...this.state,
                        disconnecting: false,
                        error: "No pudimos desconectar WhatsApp. Intentá nuevamente.",
                    };
                },
            });
    }

    get statusText(): string {
        switch (this.state.status) {
            case WhatsAppConnectionStatus.CONNECTED:
                return "WhatsApp conectado";
            case WhatsAppConnectionStatus.CONNECTING:
                return "Conectando WhatsApp";
            case WhatsAppConnectionStatus.QR_READY:
                return "QR listo para escanear";
            case WhatsAppConnectionStatus.INITIALIZING:
                return "Verificando conexión";
            case WhatsAppConnectionStatus.ERROR:
                return "Requiere atención";
            default:
                return "WhatsApp desconectado";
        }
    }

    get statusDescription(): string {
        if (this.state.loading) {
            return "Estamos leyendo el estado actual antes de habilitar el flujo correcto.";
        }

        if (this.state.isConnected) {
            return "Listo para elegir destinatarios y enviar el mensaje.";
        }

        if (this.state.error) {
            return this.state.error;
        }

        return "Conectá WhatsApp para habilitar el envío masivo.";
    }

    get statusClass(): string {
        if (this.state.isConnected) return "connected";
        if (this.state.status === WhatsAppConnectionStatus.ERROR) return "error";
        return "pending";
    }

    private loadWhatsAppStatus(): void {
        this.notificationService
            .getWhatsAppStatus()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (status) => this.applyStatus(status),
                error: () => {
                    this.state = {
                        status: WhatsAppConnectionStatus.ERROR,
                        isConnected: false,
                        loading: false,
                        error:
                            "No pudimos leer el estado de WhatsApp. Revisá la conexión o intentá nuevamente.",
                    };
                },
            });
    }

    private applyStatus(status: WhatsAppStatusResponse): void {
        this.state = {
            status: status.status || WhatsAppConnectionStatus.DISCONNECTED,
            isConnected: status.isConnected || status.status === WhatsAppConnectionStatus.CONNECTED,
            loading: false,
            disconnecting: false,
            error: status.error,
        };
    }
}
