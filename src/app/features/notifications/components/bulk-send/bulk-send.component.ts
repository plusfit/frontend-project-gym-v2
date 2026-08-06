import { AsyncPipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Store } from "@ngxs/store";
import { Observable, of } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { EClientRole } from "../../../../core/enums/client-role.enum";
import { ClientService } from "../../../client/services/client.service";
import { ClearBulkStatus, SendBulkMessage } from "../../actions/bulk-notifications.actions";
import {
    BulkSendSkipReason,
    BulkSendSkipped,
    BulkStatusResponse,
} from "../../interface/bulk-status.interface";
import { RecipientSelection, toRecipientCandidates } from "../../models/recipient-selection";
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
    imports: [AsyncPipe, FormsModule, BulkStatusLabelPipe],
    templateUrl: "./bulk-send.component.html",
    styleUrls: ["./bulk-send.component.css"],
})
export class BulkSendComponent implements OnInit {
    /**
     * Matches the cap the notifications service accepts in one batch. The modal
     * deliberately does not paginate: the admin narrows with filters and sees
     * the whole result set, so one request must be able to hold all of it.
     */
    static readonly MAX_RECIPIENTS = 1000;

    step: BulkSendStep = "select";
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

    constructor(
        private clientService: ClientService,
        private store: Store,
    ) {}

    ngOnInit(): void {
        this.bulkStatus$ = this.store.select(BulkNotificationsState.getBulkStatus);
        this.sending$ = this.store.select(BulkNotificationsState.isBulkLoading);
        this.sendError$ = this.store.select(BulkNotificationsState.getBulkError);
        this.skipped$ = this.store.select(BulkNotificationsState.getSkipped);
        this.requested$ = this.store.select(BulkNotificationsState.getRequested);

        this.loadClients();
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
            this.selection.clear();
            return;
        }

        this.selection.selectAll();
    }

    get canGoToReview(): boolean {
        return this.selection.canSend;
    }

    get canSend(): boolean {
        return this.canGoToReview && this.message.trim().length > 0;
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
                    this.selection.setCandidates(toRecipientCandidates(response?.data?.data ?? []));
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
