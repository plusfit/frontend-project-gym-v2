import { TestBed } from "@angular/core/testing";
import { SnackBarService } from "@core/services/snackbar.service";
import { NgxsModule, Store } from "@ngxs/store";
import { of, throwError } from "rxjs";
import { SendBulkMessage } from "../actions/bulk-notifications.actions";
import { BulkSendResponse, BulkStatus } from "../interface/bulk-status.interface";
import { NotificationService } from "../services/notification.service";
import { BulkNotificationsState } from "./bulk-notifications.state";

/**
 * State for the file-less bulk send. On success it seeds a pending batch so the
 * existing progress polling takes over unchanged, and keeps the list of clients
 * the backend could not reach so the dialog can show it.
 */
describe("BulkNotificationsState.SendBulkMessage", () => {
    let store: Store;
    let notificationService: jasmine.SpyObj<NotificationService>;
    let snackbar: jasmine.SpyObj<SnackBarService>;

    const SKIPPED = [{ clientId: "id-2", name: "Juan Gomez", reason: "no_phone" as const }];

    function accepted(overrides: Partial<BulkSendResponse> = {}): BulkSendResponse {
        return { batchId: "batch-1", total: 2, requested: 2, skipped: [], ...overrides };
    }

    beforeEach(() => {
        notificationService = jasmine.createSpyObj("NotificationService", [
            "sendBulkMessage",
            "getBulkStatus",
        ]);
        snackbar = jasmine.createSpyObj("SnackBarService", ["showError", "showSuccess"]);
        // Keep the polling action from firing real requests during these specs.
        notificationService.getBulkStatus.and.returnValue(
            of({
                batchId: "batch-1",
                status: BulkStatus.COMPLETED,
                totalRows: 0,
                processedRows: 0,
                successCount: 0,
                failureCount: 0,
            }),
        );

        TestBed.configureTestingModule({
            imports: [NgxsModule.forRoot([BulkNotificationsState])],
            providers: [
                { provide: NotificationService, useValue: notificationService },
                { provide: SnackBarService, useValue: snackbar },
            ],
        });

        store = TestBed.inject(Store);
    });

    function send(clientIds = ["id-1", "id-2"], message = "Hola") {
        return store.dispatch(new SendBulkMessage(clientIds, message));
    }

    function snapshot() {
        return store.snapshot().bulkNotifications;
    }

    it("delegates to the service with the selected ids and message", () => {
        notificationService.sendBulkMessage.and.returnValue(of(accepted()));

        send(["id-1", "id-2"], "Hola gente");

        expect(notificationService.sendBulkMessage).toHaveBeenCalledWith(
            ["id-1", "id-2"],
            "Hola gente",
        );
    });

    /**
     * Seeding a pending batch means the progress bar and the polling action
     * behave exactly as they did for the CSV flow, with no changes.
     */
    it("seeds a pending batch so the existing polling takes over", () => {
        notificationService.sendBulkMessage.and.returnValue(
            of(accepted({ batchId: "batch-7", total: 5 })),
        );

        send();

        expect(snapshot().bulkStatus).toEqual({
            batchId: "batch-7",
            status: BulkStatus.PENDING,
            totalRows: 5,
            processedRows: 0,
            successCount: 0,
            failureCount: 0,
        });
    });

    it("stores the clients the backend could not reach", () => {
        notificationService.sendBulkMessage.and.returnValue(
            of(accepted({ total: 1, requested: 2, skipped: SKIPPED })),
        );

        send();

        expect(snapshot().skipped).toEqual(SKIPPED);
        expect(snapshot().requested).toBe(2);
    });

    it("clears loading and any previous error on success", () => {
        notificationService.sendBulkMessage.and.returnValue(of(accepted()));

        send();

        expect(snapshot().bulkLoading).toBeFalse();
        expect(snapshot().bulkError).toBeNull();
    });

    it("reports how many recipients were actually enqueued", () => {
        notificationService.sendBulkMessage.and.returnValue(
            of(accepted({ total: 47, requested: 50 })),
        );

        send();

        expect(snapshot().bulkStatus.totalRows).toBe(47);
        expect(snapshot().requested).toBe(50);
    });

    describe("when the send fails", () => {
        function fail(message: string) {
            notificationService.sendBulkMessage.and.returnValue(
                throwError(() => ({ error: { message } })),
            );
        }

        it("keeps the reason the backend gave", () => {
            fail("No reachable recipients: every selected client is missing a valid phone");

            send().subscribe({ error: () => undefined });

            expect(snapshot().bulkError).toContain("No reachable recipients");
            expect(snapshot().bulkLoading).toBeFalse();
        });

        it("shows the reason to the user", () => {
            fail("Daily message cap reached");

            send().subscribe({ error: () => undefined });

            expect(snackbar.showError).toHaveBeenCalled();
            expect(snapshot().bulkError).toBe("Daily message cap reached");
        });

        it("falls back to a generic message when the backend sends none", () => {
            notificationService.sendBulkMessage.and.returnValue(throwError(() => ({})));

            send().subscribe({ error: () => undefined });

            expect(snapshot().bulkError).toBeTruthy();
        });

        it("does not leave a batch behind", () => {
            fail("boom");

            send().subscribe({ error: () => undefined });

            expect(snapshot().bulkStatus).toBeNull();
        });
    });
});
