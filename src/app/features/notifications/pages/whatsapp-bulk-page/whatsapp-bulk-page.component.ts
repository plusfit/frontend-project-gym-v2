import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import {
    ConfirmDialogComponent,
    DialogType,
} from "@shared/components/confirm-dialog/confirm-dialog.component";
import {
    Observable,
    ReplaySubject,
    Subject,
    finalize,
    map,
    merge,
    take,
    takeUntil,
} from "rxjs";
import { BulkSendComponent } from "../../components/bulk-send/bulk-send.component";
import { WhatsAppConnectionComponent } from "../../components/whatsapp-connection/whatsapp-connection.component";
import {
    WhatsAppConnectionStatus,
    WhatsAppStatusResponse,
} from "../../interface/whatsapp-status.interface";
import { NotificationService } from "../../services/notification.service";
import { describeWhatsAppStatus } from "../../utils/whatsapp-status.util";

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
export class WhatsappBulkPageComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly WhatsAppConnectionStatus = WhatsAppConnectionStatus;

    @ViewChild("pageTitle")
    pageTitle?: ElementRef<HTMLElement>;

    @ViewChild(BulkSendComponent)
    bulkSend?: BulkSendComponent;

    state: WhatsappBulkPageState = {
        status: WhatsAppConnectionStatus.INITIALIZING,
        isConnected: false,
        loading: true,
    };

    /**
     * The status the connection panel starts from, so mounting it does not
     * repeat the request this page just answered.
     *
     * Kept as a memoized field rather than a getter: the template reads it on
     * every check, and a getter returning a fresh object literal each time
     * trips ExpressionChangedAfterItHasBeenCheckedError while the panel is
     * rendered. `refreshConnectionSeed()` only replaces the reference when
     * the underlying status actually changes.
     */
    connectionSeed?: WhatsAppStatusResponse;

    private destroy$ = new Subject<void>();

    /** Guards against stacking a second confirm dialog while one is pending. */
    private pendingDiscardConfirmation$?: Observable<boolean>;

    constructor(
        private notificationService: NotificationService,
        private router: Router,
        private dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.loadWhatsAppStatus();
    }

    /**
     * The dialog this page replaced moved focus into itself on open. A routed
     * page moves nothing, so a screen reader keeps announcing the list we just
     * left: focus goes to the heading, which is where the new page begins.
     */
    ngAfterViewInit(): void {
        this.pageTitle?.nativeElement.focus();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Guards the draft on the way out — browser back included. Answering true
     * when there is nothing in progress keeps the common exit instant.
     */
    canDeactivate(): boolean | Observable<boolean> {
        if (!this.bulkSend?.hasUnsavedDraft()) {
            return true;
        }

        return this.askToDiscardDraft();
    }

    goBack(): void {
        // The trigger that opened this page is where focus belonged all along;
        // the list restores it when it sees the flag.
        this.router.navigate(["/notificaciones"], { state: { focusBulkTrigger: true } });
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
                    this.refreshConnectionSeed();
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
        return describeWhatsAppStatus(this.state.status).label;
    }

    get statusDescription(): string {
        if (this.state.loading) {
            return describeWhatsAppStatus(WhatsAppConnectionStatus.INITIALIZING).description;
        }

        if (this.state.isConnected) {
            return describeWhatsAppStatus(WhatsAppConnectionStatus.CONNECTED).description;
        }

        // What actually went wrong beats any generic sentence about the status.
        if (this.state.error) {
            return this.state.error;
        }

        return describeWhatsAppStatus(this.state.status).description;
    }

    get statusClass(): string {
        if (this.state.isConnected) return "connected";

        return describeWhatsAppStatus(this.state.status).cssClass;
    }

    /**
     * Asks before dropping the draft.
     *
     * The dialog can also be dismissed with Escape or a backdrop click, which
     * never reaches confirm: afterClosed then answers for it, and staying is
     * the safe reading of a dialog nobody answered.
     *
     * canDeactivate() can fire again before the first confirmation settles
     * (e.g. two rapid navigation attempts). While one is pending, the same
     * observable is handed back instead of opening a second, orphaned dialog.
     */
    private askToDiscardDraft(): Observable<boolean> {
        if (this.pendingDiscardConfirmation$) {
            return this.pendingDiscardConfirmation$;
        }

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: "500px",
            data: {
                title: "Salir del envío masivo",
                contentMessage:
                    "Si salís ahora se pierden los destinatarios seleccionados y el mensaje escrito. ¿Querés salir igual?",
                type: DialogType.GENERAL,
                confirmButtonText: "Salir sin enviar",
            },
        });

        const confirmed$ = new ReplaySubject<boolean>(1);
        const confirmSubscription = dialogRef.componentInstance.confirm.subscribe((confirmed) =>
            confirmed$.next(confirmed),
        );

        const pendingConfirmation$ = merge(
            confirmed$,
            dialogRef.afterClosed().pipe(map(() => false)),
        ).pipe(
            take(1),
            finalize(() => {
                confirmSubscription.unsubscribe();
                this.pendingDiscardConfirmation$ = undefined;
            }),
        );

        this.pendingDiscardConfirmation$ = pendingConfirmation$;

        return pendingConfirmation$;
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
                    this.refreshConnectionSeed();
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
        this.refreshConnectionSeed();
    }

    /**
     * Withheld when our own read failed: there is nothing worth handing
     * down, and the panel's own fetch may well succeed where ours did not.
     *
     * Only replaces `connectionSeed` when the underlying status actually
     * changed, so the template keeps the same object reference across ticks
     * and Angular's change detection does not flag it as a fresh value.
     */
    private refreshConnectionSeed(): void {
        const shouldWithholdSeed =
            this.state.loading ||
            this.state.error ||
            this.state.status === WhatsAppConnectionStatus.ERROR;

        if (shouldWithholdSeed) {
            this.connectionSeed = undefined;
            return;
        }

        if (
            this.connectionSeed &&
            this.connectionSeed.status === this.state.status &&
            this.connectionSeed.isConnected === this.state.isConnected
        ) {
            return;
        }

        this.connectionSeed = {
            status: this.state.status,
            isConnected: this.state.isConnected,
        };
    }
}
