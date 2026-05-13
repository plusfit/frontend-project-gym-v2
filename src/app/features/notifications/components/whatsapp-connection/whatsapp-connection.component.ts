import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output } from "@angular/core";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { AuthState } from "@features/auth/state/auth.state";
import { Store } from "@ngxs/store";
import { Subject, interval } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { environment } from "../../../../../environments/environment";
import { WhatsAppConnectionStatus, WhatsAppStatusResponse } from "../../interface/whatsapp-status.interface";
import { NotificationService } from "../../services/notification.service";

const STATUS_POLL_MS = 3000;

@Component({
    selector: "app-whatsapp-connection",
    standalone: true,
    imports: [MatSnackBarModule],
    templateUrl: "./whatsapp-connection.component.html",
    styleUrls: ["./whatsapp-connection.component.css"],
})
export class WhatsAppConnectionComponent implements OnInit, OnDestroy {
    @Output() statusChange = new EventEmitter<WhatsAppStatusResponse>();

    status: string = "disconnected";
    qrCode: string | null = null;
    errorMessage: string | null = null;
    isConnected: boolean = false;

    private destroy$ = new Subject<void>();
    private stopPolling$ = new Subject<void>();
    private eventSource: EventSource | null = null;

    constructor(
        private notificationService: NotificationService,
        private cdr: ChangeDetectorRef,
        private store: Store,
        private snackBar: MatSnackBar,
    ) {}

    ngOnInit(): void {
        this.loadStatus(true);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.stopPolling$.next();
        this.stopPolling$.complete();
        this.stopQrListener();
    }

    private loadStatus(initial: boolean = false): void {
        this.notificationService
            .getWhatsAppStatus()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    const previousIsConnected = this.isConnected;
                    this.status = response.status || "disconnected";
                    this.isConnected = response.isConnected || false;
                    this.errorMessage = response.error || null;
                    this.emitStatusChange();

                    if (!previousIsConnected && this.isConnected) {
                        this.handleConnectionSuccess();
                    } else if (initial && !this.isConnected) {
                        this.startQrListener();
                        this.startStatusPolling();
                    }

                    this.cdr.detectChanges();
                },
                error: (err) => {
                    this.status = WhatsAppConnectionStatus.ERROR;
                    this.errorMessage = "Error al cargar estado: " + (err.message || "Unknown");
                    this.emitStatusChange();
                    this.cdr.detectChanges();
                },
            });
    }

    private handleConnectionSuccess(): void {
        this.qrCode = null;
        this.stopQrListener();
        this.stopStatusPolling();
        this.snackBar.open("WhatsApp conectado correctamente", "Cerrar", {
            duration: 4000,
            panelClass: ["snackbar-success"],
        });
    }

    private startStatusPolling(): void {
        interval(STATUS_POLL_MS)
            .pipe(takeUntil(this.stopPolling$), takeUntil(this.destroy$))
            .subscribe(() => this.loadStatus(false));
    }

    private stopStatusPolling(): void {
        this.stopPolling$.next();
    }

    startQrListener(): void {
        this.stopQrListener();

        const token = this.store.selectSnapshot(AuthState.accessToken);
        if (!token) {
            this.errorMessage = "No autenticado";
            return;
        }

        const url = `${environment.api}/whatsapp/qr?token=${encodeURIComponent(token)}`;
        const eventSource = new EventSource(url);

        eventSource.onmessage = (event) => {
            try {
                const data = this.parseQrEvent(event.data);

                if (data?.qr) {
                    this.qrCode = data.qr;
                    this.status = WhatsAppConnectionStatus.QR_READY;
                    this.emitStatusChange();
                    this.cdr.detectChanges();
                }
            } catch {
                // Ignore parse errors
            }
        };

        eventSource.onerror = () => {
            eventSource.close();
            this.eventSource = null;
        };

        this.eventSource = eventSource;
    }

    stopQrListener(): void {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }

    disconnect(): void {
        this.notificationService.logoutWhatsApp().subscribe({
            next: () => {
                this.qrCode = null;
                this.isConnected = false;
                this.status = WhatsAppConnectionStatus.DISCONNECTED;
                this.emitStatusChange();
                this.startQrListener();
                this.startStatusPolling();
                this.cdr.detectChanges();
            },
            error: () => {
                this.errorMessage = "Error al desconectar";
            },
        });
    }

    getStatusClass(): string {
        const statusLower = this.status.toLowerCase();
        switch (statusLower) {
            case "connected":
                return "connected";
            case "connecting":
            case "qr_ready":
            case "initializing":
                return "pending";
            case "error":
            case "disconnected":
            default:
                return "disconnected";
        }
    }

    getStatusText(): string {
        const statusLower = this.status.toLowerCase();
        switch (statusLower) {
            case "connected":
                return "Conectado";
            case "connecting":
                return "Preparando conexión";
            case "qr_ready":
                return "QR listo para escanear";
            case "initializing":
                return "Preparando QR";
            case "error":
                return "Error";
            case "disconnected":
                return "Desconectado";
            default:
                return "Estado desconocido";
        }
    }

    getQrImageUrl(): string {
        if (!this.qrCode) return "";
        return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(this.qrCode)}`;
    }

    private parseQrEvent(rawEventData: string): { qr?: string } | null {
        const parsed = JSON.parse(rawEventData);

        if (parsed?.qr) {
            return parsed;
        }

        if (typeof parsed?.data === "string") {
            return JSON.parse(parsed.data);
        }

        return null;
    }

    private emitStatusChange(): void {
        this.statusChange.emit({
            status: this.status as WhatsAppConnectionStatus,
            isConnected: this.isConnected,
            error: this.errorMessage || undefined,
        });
    }
}
