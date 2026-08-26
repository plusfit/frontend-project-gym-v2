import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from "@angular/core";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { AuthState } from "@features/auth/state/auth.state";
import { Store } from "@ngxs/store";
import { Subject, interval } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { environment } from "../../../../../environments/environment";
import { WhatsAppConnectionStatus, WhatsAppStatusResponse } from "../../interface/whatsapp-status.interface";
import { NotificationService } from "../../services/notification.service";
import { WhatsAppStatusDescriptor, describeWhatsAppStatus } from "../../utils/whatsapp-status.util";

const STATUS_POLL_MS = 3000;

@Component({
    selector: "app-whatsapp-connection",
    standalone: true,
    imports: [MatSnackBarModule],
    templateUrl: "./whatsapp-connection.component.html",
    styleUrls: ["./whatsapp-connection.component.css"],
})
export class WhatsAppConnectionComponent implements OnInit, OnDestroy {
    /**
     * A status the host already fetched. Given one, this panel skips its own
     * first request: two identical reads a few milliseconds apart tell nobody
     * anything new. Absent, it behaves as it always did and asks for itself.
     */
    @Input() initialStatus?: WhatsAppStatusResponse;

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
        if (this.initialStatus) {
            this.adoptStatus(this.initialStatus);
            return;
        }

        this.loadStatus(true);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.stopPolling$.next();
        this.stopPolling$.complete();
        this.stopQrListener();
    }

    /**
     * Starts from the host's reading instead of a request of our own.
     *
     * The QR stream and the polling still start exactly as they would after a
     * first fetch — only the round trip is skipped. No connection snackbar
     * either: nothing connected just now, it already was.
     */
    private adoptStatus(status: WhatsAppStatusResponse): void {
        this.status = status.status || "disconnected";
        this.isConnected = status.isConnected || false;
        this.errorMessage = status.error || null;
        this.emitStatusChange();

        if (!this.isConnected) {
            this.startQrListener();
            this.startStatusPolling();
        }
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

    /** Same reading of the status the bulk send page shows, from one place. */
    get statusDescriptor(): WhatsAppStatusDescriptor {
        return describeWhatsAppStatus(this.status);
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
