import { fakeAsync, tick } from "@angular/core/testing";
import { Store } from "@ngxs/store";
import { of, throwError } from "rxjs";
import { EClientRole } from "../../../../core/enums/client-role.enum";
import { ClientService } from "../../../client/services/client.service";
import { SendBulkMessage } from "../../actions/bulk-notifications.actions";
import { BulkNotificationsState } from "../../state/bulk-notifications.state";
import { BulkSendComponent } from "./bulk-send.component";

/**
 * The file-less bulk send flow: filter the clients, confirm who is in, paste the
 * message, send. No CSV is downloaded, uploaded or parsed anywhere.
 */
describe("BulkSendComponent", () => {
    const ANA = { _id: "1", email: "ana@mail.com", userInfo: { name: "Ana", phone: "099123456" } };
    const BETO = { _id: "2", email: "beto@mail.com", userInfo: { name: "Beto", phone: "099123457" } };
    const SIN_TEL = { _id: "3", email: "caro@mail.com", userInfo: { name: "Caro" } };

    const SKIPPED = [{ clientId: "3", name: "Caro", reason: "no_phone" as const }];

    const RUNNING_BATCH = {
        batchId: "batch-1",
        status: "processing",
        totalRows: 2,
        processedRows: 1,
        successCount: 1,
        failureCount: 0,
    };

    function setup(
        clients: unknown[] = [ANA, BETO],
        skipped = SKIPPED,
        batchInFlight: unknown = null,
    ) {
        const clientService = jasmine.createSpyObj("ClientService", ["getClientsByName"]);
        clientService.getClientsByName.and.returnValue(
            of({ success: true, data: { data: clients, total: clients.length } }),
        );

        const store = jasmine.createSpyObj("Store", ["dispatch", "select", "selectSnapshot"]);
        store.dispatch.and.returnValue(of(undefined));
        store.selectSnapshot.and.returnValue(batchInFlight);
        store.select.and.callFake((selector: unknown) => {
            if (selector === BulkNotificationsState.getSkipped) return of(skipped);
            if (selector === BulkNotificationsState.getRequested) return of(2);
            if (selector === BulkNotificationsState.isBulkLoading) return of(false);
            return of(null);
        });

        const notificationService = jasmine.createSpyObj("NotificationService", [
            "sendTestMessage",
        ]);
        notificationService.sendTestMessage.and.returnValue(
            of({ jobId: "job-1", status: "queued", scheduledFor: "2026-08-08T16:00:00Z" }),
        );

        const component = new BulkSendComponent(clientService, store, notificationService);
        component.ngOnInit();

        return { component, clientService, store, notificationService };
    }

    describe("loading the candidates", () => {
        it("fetches clients on init", () => {
            const { clientService } = setup();

            expect(clientService.getClientsByName).toHaveBeenCalled();
        });

        /**
         * The modal does not paginate: the admin narrows with filters and sees
         * the whole result set at once, so the page size must cover the cap the
         * backend accepts in one request.
         */
        it("asks for a page big enough to cover the recipient cap", () => {
            const { clientService } = setup();
            const [page, limit] = clientService.getClientsByName.calls.mostRecent().args;

            expect(page).toBe(1);
            expect(limit).toBeGreaterThanOrEqual(BulkSendComponent.MAX_RECIPIENTS);
        });

        /** Bulk campaigns are for clients, never for staff accounts. */
        it("restricts the query to the client role", () => {
            const { clientService } = setup();

            expect(clientService.getClientsByName.calls.mostRecent().args).toContain(
                EClientRole.CLIENT,
            );
        });

        it("flattens the api shape into candidates", () => {
            const { component } = setup([ANA, SIN_TEL]);

            expect(component.selection.candidates).toEqual([
                { _id: "1", name: "Ana", phone: "099123456" },
                { _id: "3", name: "Caro", phone: null },
            ]);
        });

        /**
         * A bulk sender must never open with recipients already chosen: the
         * admin could filter and send without ever reading the list.
         */
        it("selects nobody on load", () => {
            const { component } = setup([ANA, BETO]);

            expect(component.selection.selectedCount).toBe(0);
        });

        it("surfaces a failure instead of an empty list", () => {
            const clientService = jasmine.createSpyObj("ClientService", ["getClientsByName"]);
            clientService.getClientsByName.and.returnValue(throwError(() => new Error("boom")));
            const store = jasmine.createSpyObj("Store", ["dispatch", "select", "selectSnapshot"]);
            store.select.and.returnValue(of(null));
            store.selectSnapshot.and.returnValue(null);
            const notificationService = jasmine.createSpyObj("NotificationService", [
                "sendTestMessage",
            ]);

            const component = new BulkSendComponent(clientService, store, notificationService);
            component.ngOnInit();

            expect(component.loadError).toBeTruthy();
            expect(component.loadingClients).toBeFalse();
        });
    });

    describe("filtering", () => {
        it("refetches with the new filter", () => {
            const { component, clientService } = setup();

            component.applyFilters({ overdue: true });

            expect(clientService.getClientsByName).toHaveBeenCalledTimes(2);
            expect(clientService.getClientsByName.calls.mostRecent().args).toContain(true);
        });

        it("passes the search term through", () => {
            const { component, clientService } = setup();

            component.applyFilters({ searchQ: "ana" });

            expect(clientService.getClientsByName.calls.mostRecent().args).toContain("ana");
        });

        it("returns to the selection step so the new result set is reviewed", () => {
            const { component } = setup();
            component.toggleAll();
            component.goToReview();

            component.applyFilters({ overdue: true });

            expect(component.step).toBe("select");
        });

        /**
         * Typing fires one request per keystroke without a debounce: "nahue"
         * would be five full client fetches. Keystrokes must collapse into a
         * single request for the final term.
         */
        it("debounces typed search input into a single refetch", fakeAsync(() => {
            const { component, clientService } = setup();

            component.onSearchQueryChange("n");
            component.onSearchQueryChange("na");
            component.onSearchQueryChange("nahue");

            // Only the initial load has happened so far.
            expect(clientService.getClientsByName).toHaveBeenCalledTimes(1);

            tick(400);

            expect(clientService.getClientsByName).toHaveBeenCalledTimes(2);
            expect(clientService.getClientsByName.calls.mostRecent().args).toContain("nahue");
        }));

        it("skips the refetch when the debounced term did not change", fakeAsync(() => {
            const { component, clientService } = setup();

            component.onSearchQueryChange("ana");
            tick(400);
            component.onSearchQueryChange("ana");
            tick(400);

            expect(clientService.getClientsByName).toHaveBeenCalledTimes(2);
        }));

        it("stops reacting to search input after destroy", fakeAsync(() => {
            const { component, clientService } = setup();

            component.ngOnDestroy();
            component.onSearchQueryChange("ana");
            tick(400);

            expect(clientService.getClientsByName).toHaveBeenCalledTimes(1);
        }));
    });

    describe("presenting the candidates", () => {
        it("builds initials for the avatar from the first two words", () => {
            const { component } = setup();

            expect(component.initials("Nahuel Gil Curbelo")).toBe("NG");
            expect(component.initials("ana")).toBe("A");
            expect(component.initials("  ")).toBe("?");
        });
    });

    /**
     * The reported bug: searching for a second person wiped the first one. The
     * selection is a basket that survives result-set changes; what depends on
     * the filter is only whether NEW rows arrive ticked.
     */
    describe("keeping the selection across searches", () => {
        function searchFor(context: ReturnType<typeof setup>, term: string, results: unknown[]) {
            context.clientService.getClientsByName.and.returnValue(
                of({ success: true, data: { data: results, total: results.length } }),
            );
            context.component.applyFilters({ searchQ: term });
        }

        it("keeps a client picked in a previous search", () => {
            // Empty initial load, so the pick below is the admin's own doing.
            const context = setup([]);
            searchFor(context, "ana", [ANA]);
            context.component.toggle("1");

            searchFor(context, "beto", [BETO]);

            expect(context.component.selection.isSelected("1")).toBeTrue();
        });

        it("accumulates picks made in different searches", () => {
            const context = setup([]);
            searchFor(context, "ana", [ANA]);
            context.component.toggle("1");
            searchFor(context, "beto", [BETO]);
            context.component.toggle("2");

            expect(context.component.selection.selectedIds).toEqual(["1", "2"]);
        });

        /**
         * Hunting for one person must not tick everyone who happens to match a
         * half-typed term — that is how a campaign reaches the wrong people.
         */
        it("does not preselect the results of a search", () => {
            const context = setup([]);

            searchFor(context, "ana", [ANA, BETO]);

            expect(context.component.selection.selectedCount).toBe(0);
        });

        /** No shape of filter preselects: every recipient is an explicit act. */
        it("does not preselect the results of a plain filter either", () => {
            const { component, clientService } = setup([]);
            clientService.getClientsByName.and.returnValue(
                of({ success: true, data: { data: [ANA, BETO], total: 2 } }),
            );

            component.applyFilters({ overdue: true });

            expect(component.selection.selectedCount).toBe(0);
        });

        it("surfaces how many picks the current filter hides", () => {
            const context = setup([ANA, BETO]);
            context.component.toggleAll();

            searchFor(context, "caro", [SIN_TEL]);

            expect(context.component.selection.offScreenCount).toBe(2);
        });

        it("empties the basket when the admin asks to start over", () => {
            const context = setup([ANA, BETO]);
            context.component.toggleAll();

            context.component.clearSelection();

            expect(context.component.selection.selectedCount).toBe(0);
        });
    });

    describe("selecting recipients", () => {
        it("selects a client", () => {
            const { component } = setup([ANA, BETO]);

            component.toggle("1");

            expect(component.selection.isSelected("1")).toBeTrue();
            expect(component.selection.selectedCount).toBe(1);
        });

        it("unselects a client that was selected", () => {
            const { component } = setup([ANA, BETO]);
            component.toggleAll();

            component.toggle("1");

            expect(component.selection.isSelected("1")).toBeFalse();
            expect(component.selection.selectedCount).toBe(1);
        });

        it("clears everything when all are selected", () => {
            const { component } = setup([ANA, BETO]);
            component.toggleAll();

            component.toggleAll();

            expect(component.selection.selectedCount).toBe(0);
        });

        /** The header checkbox governs the rows on screen, never the basket. */
        it("leaves hidden picks alone when unticking the visible rows", () => {
            const { component, clientService } = setup([ANA, BETO]);
            component.toggleAll();
            clientService.getClientsByName.and.returnValue(
                of({ success: true, data: { data: [SIN_TEL], total: 1 } }),
            );
            component.applyFilters({ searchQ: "caro" });
            component.toggle("3");

            component.toggleAll();

            expect(component.selection.isSelected("3")).toBeFalse();
            expect(component.selection.selectedCount).toBe(2);
        });

        it("selects everything when some are missing", () => {
            const { component } = setup([ANA, BETO]);
            component.toggle("1");

            component.toggleAll();

            expect(component.selection.selectedCount).toBe(2);
        });

        it("counts only the clients that can actually be reached", () => {
            const { component } = setup([ANA, SIN_TEL]);
            component.toggleAll();

            expect(component.selection.reachableCount).toBe(1);
            expect(component.selection.selectedWithoutPhone.length).toBe(1);
        });
    });

    /**
     * The batch runs in the store, not in this component: closing the dialog
     * kills the component but the send keeps going and keeps polling. Reopening
     * must land back on the progress view instead of an empty form that looks
     * like the campaign was never sent.
     */
    describe("reopening the dialog while a batch exists", () => {
        it("resumes on the progress step when a batch is in flight", () => {
            const { component } = setup([ANA, BETO], SKIPPED, RUNNING_BATCH);

            expect(component.step).toBe("progress");
        });

        it("resumes on the progress step when the batch already finished", () => {
            const finished = { ...RUNNING_BATCH, status: "completed", processedRows: 2 };
            const { component } = setup([ANA, BETO], SKIPPED, finished);

            expect(component.step).toBe("progress");
        });

        it("starts on the selection step when no batch exists", () => {
            const { component } = setup([ANA, BETO], SKIPPED, null);

            expect(component.step).toBe("select");
        });

        it("goes back to a clean form once the admin starts a new send", () => {
            const { component } = setup([ANA, BETO], SKIPPED, RUNNING_BATCH);

            component.restart();

            expect(component.step).toBe("select");
        });
    });

    describe("moving between steps", () => {
        it("starts on the selection step", () => {
            expect(setup().component.step).toBe("select");
        });

        it("blocks the review step when nothing is selected", () => {
            const { component } = setup([ANA]);
            component.selection.clear();

            component.goToReview();

            expect(component.step).toBe("select");
            expect(component.canGoToReview).toBeFalse();
        });

        /** The backend rejects a batch with no reachable recipient. */
        it("blocks the review step when no selected client has a phone", () => {
            const { component } = setup([SIN_TEL]);
            component.toggleAll();

            component.goToReview();

            expect(component.step).toBe("select");
        });

        it("advances to review when at least one client is reachable", () => {
            const { component } = setup([ANA, SIN_TEL]);
            component.toggleAll();

            component.goToReview();

            expect(component.step).toBe("review");
        });

        it("advances to the message step", () => {
            const { component } = setup();
            component.toggleAll();

            component.goToReview();
            component.goToCompose();

            expect(component.step).toBe("compose");
        });

        it("walks back one step at a time", () => {
            const { component } = setup();
            component.toggleAll();
            component.goToReview();
            component.goToCompose();

            component.back();
            expect(component.step).toBe("review");

            component.back();
            expect(component.step).toBe("select");
        });
    });

    describe("sending", () => {
        function readyToSend(clients: unknown[] = [ANA, BETO]) {
            const context = setup(clients);
            context.component.toggleAll();
            context.component.goToReview();
            context.component.goToCompose();
            return context;
        }

        it("blocks an empty message", () => {
            const { component, store } = readyToSend();
            component.message = "";

            component.send();

            expect(component.canSend).toBeFalse();
            expect(store.dispatch).not.toHaveBeenCalled();
        });

        it("blocks a message of only whitespace", () => {
            const { component, store } = readyToSend();
            component.message = "   \n  ";

            component.send();

            expect(store.dispatch).not.toHaveBeenCalled();
        });

        it("dispatches the selected ids and the message", () => {
            const { component, store } = readyToSend([ANA, BETO, SIN_TEL]);
            component.toggle("2");
            component.message = "Hola";

            component.send();

            expect(store.dispatch).toHaveBeenCalledWith(new SendBulkMessage(["1", "3"], "Hola"));
        });

        /** The backend normalizes the body, so it must arrive as typed. */
        it("sends the message body untouched, line breaks included", () => {
            const { component, store } = readyToSend([ANA]);
            const campaign = "*PLUSFIT*\n\n- Uno\n- Dos";
            component.message = campaign;

            component.send();

            expect(store.dispatch).toHaveBeenCalledWith(new SendBulkMessage(["1"], campaign));
        });

        it("moves to the progress step once dispatched", () => {
            const { component } = readyToSend();
            component.message = "Hola";

            component.send();

            expect(component.step).toBe("progress");
        });

        it("stays on the message step when the send fails", () => {
            const { component, store } = readyToSend();
            store.dispatch.and.returnValue(throwError(() => new Error("boom")));
            component.message = "Hola";

            component.send();

            expect(component.step).toBe("compose");
        });
    });

    describe("composing with {nombre}", () => {
        it("uses the first reachable selected client as the preview sample", () => {
            const { component } = setup([SIN_TEL, ANA, BETO]);
            component.toggleAll();

            expect(component.sampleName).toBe("Ana");
        });

        it("falls back to a neutral sample when nobody has a phone", () => {
            const { component } = setup([SIN_TEL]);
            component.toggleAll();

            expect(component.sampleName).toBe("cliente");
        });

        it("falls back to a neutral sample while nothing is selected yet", () => {
            const { component } = setup([ANA, BETO]);

            expect(component.sampleName).toBe("cliente");
        });

        it("interpolates the preview with the sample name", () => {
            const { component } = setup([ANA]);
            component.toggleAll();
            component.message = "Hola {nombre}!";

            expect(component.previewMessage).toBe("Hola Ana!");
        });

        it("appends the token when there is no cursor information", () => {
            const { component } = setup([ANA]);
            component.message = "Hola ";

            component.insertNameToken();

            expect(component.message).toBe("Hola {nombre}");
        });
    });

    describe("sending a test to my own phone", () => {
        function readyToTest() {
            const context = setup([ANA, BETO]);
            context.component.toggleAll();
            context.component.goToReview();
            context.component.goToCompose();
            context.component.message = "Hola {nombre}!";
            context.component.testPhone = "099111222";
            return context;
        }

        it("sends the interpolated message to the given phone", () => {
            const { component, notificationService } = readyToTest();

            component.sendTest();

            expect(notificationService.sendTestMessage).toHaveBeenCalledWith(
                "099111222",
                "Hola Ana!",
            );
            expect(component.testFeedback?.kind).toBe("ok");
            expect(component.testSending).toBeFalse();
        });

        it("blocks a test without phone or message", () => {
            const { component, notificationService } = readyToTest();
            component.testPhone = "  ";

            component.sendTest();

            expect(notificationService.sendTestMessage).not.toHaveBeenCalled();
        });

        it("surfaces the backend reason when the test fails", () => {
            const { component, notificationService } = readyToTest();
            notificationService.sendTestMessage.and.returnValue(
                throwError(() => ({ error: { message: "Invalid phone" } })),
            );

            component.sendTest();

            expect(component.testFeedback?.kind).toBe("error");
            expect(component.testFeedback?.text).toContain("Invalid phone");
            expect(component.testSending).toBeFalse();
        });

        it("does not leak the test feedback into the next campaign", () => {
            const { component } = readyToTest();
            component.sendTest();

            component.restart();

            expect(component.testFeedback).toBeNull();
        });
    });

    describe("reporting the outcome", () => {
        it("exposes the clients the backend could not reach", (done) => {
            const { component } = setup([ANA, SIN_TEL], SKIPPED);

            component.skipped$.subscribe((skipped) => {
                expect(skipped).toEqual(SKIPPED);
                done();
            });
        });

        it("translates every skip reason into something readable", () => {
            const { component } = setup();

            for (const reason of ["not_found", "no_phone", "invalid_phone", "duplicate_phone"]) {
                expect(component.skipReasonLabel(reason as never)).toBeTruthy();
            }
        });

        it("returns to the selection step when restarted", () => {
            const { component } = setup();
            component.goToReview();

            component.restart();

            expect(component.step).toBe("select");
            expect(component.message).toBe("");
        });
    });

    /**
     * Nothing here is persisted anywhere: a browser back drops a campaign that
     * took minutes to assemble, so the page has to know when to ask first.
     */
    describe("warning before the draft is lost", () => {
        it("has nothing to lose on an untouched form", () => {
            const { component } = setup();

            expect(component.hasUnsavedDraft()).toBeFalse();
        });

        it("counts picked recipients as work worth keeping", () => {
            const { component } = setup();

            component.toggle("1");

            expect(component.hasUnsavedDraft()).toBeTrue();
        });

        it("counts a typed message as work worth keeping", () => {
            const { component } = setup();

            component.message = "Hola {nombre}";

            expect(component.hasUnsavedDraft()).toBeTrue();
        });

        /** Whitespace is not a draft. */
        it("ignores a message that is only blank space", () => {
            const { component } = setup();

            component.message = "   \n  ";

            expect(component.hasUnsavedDraft()).toBeFalse();
        });

        /**
         * Once the batch is with the backend the form holds nothing: the
         * progress view reads from the store and survives on its own.
         */
        it("stops asking once the batch is on its way", () => {
            const { component } = setup();
            component.toggle("1");
            component.message = "Hola {nombre}";

            component.send();

            expect(component.step).toBe("progress");
            expect(component.hasUnsavedDraft()).toBeFalse();
        });
    });
});
