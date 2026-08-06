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

    function setup(clients: unknown[] = [ANA, BETO], skipped = SKIPPED) {
        const clientService = jasmine.createSpyObj("ClientService", ["getClientsByName"]);
        clientService.getClientsByName.and.returnValue(
            of({ success: true, data: { data: clients, total: clients.length } }),
        );

        const store = jasmine.createSpyObj("Store", ["dispatch", "select"]);
        store.dispatch.and.returnValue(of(undefined));
        store.select.and.callFake((selector: unknown) => {
            if (selector === BulkNotificationsState.getSkipped) return of(skipped);
            if (selector === BulkNotificationsState.getRequested) return of(2);
            if (selector === BulkNotificationsState.isBulkLoading) return of(false);
            return of(null);
        });

        const component = new BulkSendComponent(clientService, store);
        component.ngOnInit();

        return { component, clientService, store };
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

        it("preselects every candidate", () => {
            const { component } = setup([ANA, BETO]);

            expect(component.selection.selectedCount).toBe(2);
        });

        it("surfaces a failure instead of an empty list", () => {
            const clientService = jasmine.createSpyObj("ClientService", ["getClientsByName"]);
            clientService.getClientsByName.and.returnValue(throwError(() => new Error("boom")));
            const store = jasmine.createSpyObj("Store", ["dispatch", "select"]);
            store.select.and.returnValue(of(null));

            const component = new BulkSendComponent(clientService, store);
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
            component.goToReview();

            component.applyFilters({ overdue: true });

            expect(component.step).toBe("select");
        });
    });

    describe("selecting recipients", () => {
        it("unselects a client", () => {
            const { component } = setup([ANA, BETO]);

            component.toggle("1");

            expect(component.selection.isSelected("1")).toBeFalse();
            expect(component.selection.selectedCount).toBe(1);
        });

        it("clears everything when all are selected", () => {
            const { component } = setup([ANA, BETO]);

            component.toggleAll();

            expect(component.selection.selectedCount).toBe(0);
        });

        it("selects everything when some are missing", () => {
            const { component } = setup([ANA, BETO]);
            component.toggle("1");

            component.toggleAll();

            expect(component.selection.selectedCount).toBe(2);
        });

        it("counts only the clients that can actually be reached", () => {
            const { component } = setup([ANA, SIN_TEL]);

            expect(component.selection.reachableCount).toBe(1);
            expect(component.selection.selectedWithoutPhone.length).toBe(1);
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

            component.goToReview();

            expect(component.step).toBe("select");
        });

        it("advances to review when at least one client is reachable", () => {
            const { component } = setup([ANA, SIN_TEL]);

            component.goToReview();

            expect(component.step).toBe("review");
        });

        it("advances to the message step", () => {
            const { component } = setup();

            component.goToReview();
            component.goToCompose();

            expect(component.step).toBe("compose");
        });

        it("walks back one step at a time", () => {
            const { component } = setup();
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
});
