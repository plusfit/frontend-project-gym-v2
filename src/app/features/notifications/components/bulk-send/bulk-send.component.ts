import { AsyncPipe } from "@angular/common";
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Store } from "@ngxs/store";
import { Observable, Subject, of } from "rxjs";
import { catchError, debounceTime, distinctUntilChanged, takeUntil, tap } from "rxjs/operators";
import { BadgeComponent } from "@shared/components/badge/badge.component";
import { LoaderComponent } from "@shared/components/loader/loader.component";
import { EColorBadge } from "@shared/enums/badge-color.enum";
import { EClientRole } from "../../../../core/enums/client-role.enum";
import { ClientService } from "../../../client/services/client.service";
import { ClearBulkStatus, SendBulkMessage } from "../../actions/bulk-notifications.actions";
import {
    BulkSendSkipReason,
    BulkSendSkipped,
    BulkStatusResponse,
} from "../../interface/bulk-status.interface";
import { NAME_TOKEN, insertToken, interpolateName } from "../../models/message-template";
import { RecipientSelection, toRecipientCandidates } from "../../models/recipient-selection";
import { WhatsAppFormatPipe } from "../../pipes/whatsapp-format.pipe";
import { NotificationService } from "../../services/notification.service";
import { BulkNotificationsState } from "../../state/bulk-notifications.state";
import { BulkStatusLabelPipe } from "../bulk-upload/bulk-status-label.pipe";

export type BulkSendStep = "select" | "review" | "compose" | "progress";

/** Paginated envelope the clients endpoint returns. */
interface ClientsPageResponse {
    data?: {
        data?: { _id: string; email?: string; userInfo?: { name?: string; phone?: string } }[];
        total?: number;
    };
}

export interface BulkSendFilters {
    searchQ: string;
    withoutPlan: boolean;
    disabled: boolean;
    overdue: boolean;
}

const SKIP_REASON_LABELS: Record<BulkSendSkipReason, string> = {
    not_found: "Ya no existe en la base",
    no_phone: "Sin teléfono registrado",
    invalid_phone: "Teléfono con formato inválido",
    duplicate_phone: "Comparte el teléfono con otro cliente",
};

/**
 * File-less bulk send: filter the clients, confirm who is in, paste the message
 * and send. Nothing is written to a file, downloaded, uploaded or parsed — the
 * backend resolves phones from the ids selected here.
 */
@Component({
    selector: "app-bulk-send",
    standalone: true,
    imports: [
        AsyncPipe,
        FormsModule,
        BulkStatusLabelPipe,
        BadgeComponent,
        LoaderComponent,
        WhatsAppFormatPipe,
    ],
    templateUrl: "./bulk-send.component.html",
    styleUrls: ["./bulk-send.component.css"],
})
export class BulkSendComponent implements OnInit, OnDestroy {
    /**
     * Matches the cap the notifications service accepts in one batch. The modal
     * deliberately does not paginate: the admin narrows with filters and sees
     * the whole result set, so one request must be able to hold all of it.
     */
    static readonly MAX_RECIPIENTS = 1000;

    /** One request per keystroke is a DDoS against our own API. */
    private static readonly SEARCH_DEBOUNCE_MS = 400;

    /** The admin's own phone survives between campaigns; retyping it invites typos. */
    private static readonly TEST_PHONE_STORAGE_KEY = "plusfit.bulk-send.test-phone";

    readonly EColorBadge = EColorBadge;
    readonly NAME_TOKEN = NAME_TOKEN;

    @ViewChild("composeArea")
    composeArea?: ElementRef<HTMLTextAreaElement>;

    step: BulkSendStep = "select";
    testPhone = "";
    testSending = false;
    testFeedback: { kind: "ok" | "error"; text: string } | null = null;
    filters: BulkSendFilters = {
        searchQ: "",
        withoutPlan: false,
        disabled: false,
        overdue: false,
    };
    selection = new RecipientSelection([]);
    message = "";
    loadingClients = false;
    loadError: string | null = null;

    bulkStatus$!: Observable<BulkStatusResponse | null>;
    sending$!: Observable<boolean>;
    sendError$!: Observable<string | null>;
    skipped$!: Observable<BulkSendSkipped[]>;
    requested$!: Observable<number | null>;

    private readonly searchInput$ = new Subject<string>();
    private readonly destroy$ = new Subject<void>();

    constructor(
        private clientService: ClientService,
        private store: Store,
        private notificationService: NotificationService,
    ) {}

    ngOnInit(): void {
        this.bulkStatus$ = this.store.select(BulkNotificationsState.getBulkStatus);
        this.sending$ = this.store.select(BulkNotificationsState.isBulkLoading);
        this.sendError$ = this.store.select(BulkNotificationsState.getBulkError);
        this.skipped$ = this.store.select(BulkNotificationsState.getSkipped);
        this.requested$ = this.store.select(BulkNotificationsState.getRequested);

        this.searchInput$
            .pipe(
                debounceTime(BulkSendComponent.SEARCH_DEBOUNCE_MS),
                distinctUntilChanged(),
                takeUntil(this.destroy$),
            )
            .subscribe((searchQ) => this.applyFilters({ searchQ }));

        this.testPhone =
            localStorage.getItem(BulkSendComponent.TEST_PHONE_STORAGE_KEY) ?? "";

        // The batch lives in the store and keeps polling with the dialog closed.
        // Landing on an empty form would read as "nothing was ever sent", so a
        // batch that still exists puts us straight back on its progress view.
        if (this.store.selectSnapshot(BulkNotificationsState.getBulkStatus)) {
            this.step = "progress";
        }

        this.loadClients();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /** Template entry point for typed search; collapses keystrokes into one fetch. */
    onSearchQueryChange(value: string): void {
        this.searchInput$.next(value);
    }

    /** Avatar initials: first letter of the first two words of the name. */
    initials(name: string): string {
        return (
            name
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((word) => word[0].toUpperCase())
                .join("") || "?"
        );
    }

    applyFilters(patch: Partial<BulkSendFilters>): void {
        this.filters = { ...this.filters, ...patch };
        // A new filter is a new question: the previous confirmation no longer
        // describes what is on screen.
        this.step = "select";
        this.loadClients();
    }

    toggle(id: string): void {
        this.selection.toggle(id);
    }

    toggleAll(): void {
        if (this.selection.allSelected) {
            this.selection.clearVisible();
            return;
        }

        this.selection.selectAllVisible();
    }

    /** Escape hatch: the count includes picks the current filter hides. */
    clearSelection(): void {
        this.selection.clear();
    }

    /** How many of the rows on screen are ticked, for the list header. */
    get visibleSelectedCount(): number {
        return this.selection.candidates.filter((candidate) =>
            this.selection.isSelected(candidate._id),
        ).length;
    }

    get canGoToReview(): boolean {
        return this.selection.canSend;
    }

    /**
     * Whether leaving now would throw away work the admin cannot get back.
     *
     * Recipients and message live in memory only, so a stray browser back wipes
     * a campaign that took minutes to assemble. Once the batch is on its way the
     * form holds nothing worth keeping: the progress view reads from the store
     * and survives on its own.
     */
    hasUnsavedDraft(): boolean {
        if (this.step === "progress") return false;

        return this.selection.selectedCount > 0 || this.message.trim().length > 0;
    }

    get canSend(): boolean {
        return this.canGoToReview && this.message.trim().length > 0;
    }

    /**
     * The client whose name fills {nombre} in the preview and the test send:
     * the first selected one that will actually receive the campaign.
     */
    get sampleName(): string {
        return this.selection.selectedReachable[0]?.name || "cliente";
    }

    /** Exactly what the sample client's phone will show. */
    get previewMessage(): string {
        return interpolateName(this.message, this.sampleName);
    }

    get canTest(): boolean {
        return (
            this.message.trim().length > 0 &&
            this.testPhone.trim().length > 0 &&
            !this.testSending
        );
    }

    /** Inserts {nombre} at the cursor, or at the end when there is no textarea. */
    insertNameToken(): void {
        const area = this.composeArea?.nativeElement;
        const start = area?.selectionStart ?? this.message.length;
        const end = area?.selectionEnd ?? this.message.length;

        const { text, cursor } = insertToken(this.message, NAME_TOKEN, start, end);
        this.message = text;

        if (area) {
            queueMicrotask(() => {
                area.focus();
                area.setSelectionRange(cursor, cursor);
            });
        }
    }

    /**
     * Ships the interpolated body to the admin's own phone through the same
     * pipeline a client hits, so what arrives is what the campaign will say.
     */
    sendTest(): void {
        if (!this.canTest) return;

        const phone = this.testPhone.trim();
        localStorage.setItem(BulkSendComponent.TEST_PHONE_STORAGE_KEY, phone);

        this.testSending = true;
        this.testFeedback = null;

        this.notificationService.sendTestMessage(phone, this.previewMessage).subscribe({
            next: () => {
                this.testSending = false;
                this.testFeedback = {
                    kind: "ok",
                    text: "Prueba enviada. Llega a tu WhatsApp en menos de 30 segundos.",
                };
            },
            error: (error) => {
                this.testSending = false;
                this.testFeedback = {
                    kind: "error",
                    text:
                        error?.error?.message ||
                        "No pudimos enviar la prueba. Intentá de nuevo.",
                };
            },
        });
    }

    goToReview(): void {
        if (!this.canGoToReview) return;
        this.step = "review";
    }

    goToCompose(): void {
        if (this.step !== "review") return;
        this.step = "compose";
    }

    back(): void {
        if (this.step === "compose") {
            this.step = "review";
            return;
        }

        if (this.step === "review") {
            this.step = "select";
        }
    }

    send(): void {
        if (!this.canSend) return;

        const ids = this.selection.selectedIds;
        const previousStep = this.step;
        this.step = "progress";

        this.store
            .dispatch(new SendBulkMessage(ids, this.message))
            .pipe(
                catchError(() => {
                    // Stay where the admin can fix the message and retry.
                    this.step = previousStep;
                    return of(undefined);
                }),
            )
            .subscribe();
    }

    restart(): void {
        this.step = "select";
        this.message = "";
        this.testFeedback = null;
        this.store.dispatch(new ClearBulkStatus());
        this.loadClients();
    }

    skipReasonLabel(reason: BulkSendSkipReason): string {
        return SKIP_REASON_LABELS[reason] ?? "No se pudo contactar";
    }

    private loadClients(): void {
        this.loadingClients = true;
        this.loadError = null;

        const { searchQ, withoutPlan, disabled, overdue } = this.filters;

        this.clientService
            .getClientsByName(
                1,
                BulkSendComponent.MAX_RECIPIENTS,
                searchQ,
                searchQ,
                EClientRole.CLIENT,
                searchQ,
                withoutPlan,
                disabled,
                overdue,
            )
            .pipe(
                tap((response: ClientsPageResponse) => {
                    this.selection.setCandidates(
                        toRecipientCandidates(response?.data?.data ?? []),
                    );
                    this.loadingClients = false;
                }),
                catchError(() => {
                    this.loadError = "No pudimos cargar los clientes. Intentá nuevamente.";
                    this.loadingClients = false;
                    return of(undefined);
                }),
            )
            .subscribe();
    }
}
