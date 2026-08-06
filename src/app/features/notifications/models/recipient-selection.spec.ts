import {
    RecipientCandidate,
    RecipientSelection,
    toRecipientCandidates,
} from "./recipient-selection";

/**
 * Selection state for the file-less bulk send. The admin filters the client
 * list, confirms who is in, and sends. Clients with no phone on record are
 * surfaced here so the warning appears before sending, not in the response.
 */
describe("RecipientSelection", () => {
    const ANA: RecipientCandidate = { _id: "1", name: "Ana Perez", phone: "099123456" };
    const BETO: RecipientCandidate = { _id: "2", name: "Beto Diaz", phone: "099123457" };
    const SIN_TEL: RecipientCandidate = { _id: "3", name: "Caro Sosa", phone: null };

    function selectionOf(...candidates: RecipientCandidate[]) {
        return new RecipientSelection(candidates);
    }

    describe("default state", () => {
        /**
         * Filtering is the act of choosing. Landing on an empty selection would
         * make the admin re-tick every row they just filtered for.
         */
        it("preselects every candidate", () => {
            const selection = selectionOf(ANA, BETO);

            expect(selection.selectedCount).toBe(2);
            expect(selection.allSelected).toBeTrue();
            expect(selection.isSelected("1")).toBeTrue();
        });

        it("starts empty when there are no candidates", () => {
            const selection = new RecipientSelection([]);

            expect(selection.selectedCount).toBe(0);
            expect(selection.canSend).toBeFalse();
        });
    });

    describe("toggling", () => {
        it("unselects a candidate that was selected", () => {
            const selection = selectionOf(ANA, BETO);

            selection.toggle("1");

            expect(selection.isSelected("1")).toBeFalse();
            expect(selection.selectedCount).toBe(1);
            expect(selection.allSelected).toBeFalse();
        });

        it("reselects a candidate that was unselected", () => {
            const selection = selectionOf(ANA, BETO);

            selection.toggle("1");
            selection.toggle("1");

            expect(selection.isSelected("1")).toBeTrue();
            expect(selection.selectedCount).toBe(2);
        });

        it("ignores an id that is not a candidate", () => {
            const selection = selectionOf(ANA);

            selection.toggle("does-not-exist");

            expect(selection.selectedCount).toBe(1);
            expect(selection.isSelected("does-not-exist")).toBeFalse();
        });

        it("clears every selection", () => {
            const selection = selectionOf(ANA, BETO);

            selection.clear();

            expect(selection.selectedCount).toBe(0);
            expect(selection.noneSelected).toBeTrue();
        });

        it("selects every candidate again", () => {
            const selection = selectionOf(ANA, BETO);
            selection.clear();

            selection.selectAll();

            expect(selection.selectedCount).toBe(2);
            expect(selection.allSelected).toBeTrue();
        });
    });

    describe("reporting the selection", () => {
        it("lists the selected ids in candidate order", () => {
            const selection = selectionOf(ANA, BETO, SIN_TEL);

            selection.toggle("2");

            expect(selection.selectedIds).toEqual(["1", "3"]);
        });

        it("reports neither all nor none while partially selected", () => {
            const selection = selectionOf(ANA, BETO);

            selection.toggle("1");

            expect(selection.allSelected).toBeFalse();
            expect(selection.noneSelected).toBeFalse();
        });

        it("does not report allSelected for an empty candidate list", () => {
            expect(new RecipientSelection([]).allSelected).toBeFalse();
        });
    });

    /**
     * The backend drops unreachable clients and reports them, but the admin
     * should see the count before committing so nothing looks lost afterwards.
     */
    describe("warning about clients with no phone", () => {
        it("names the selected clients that have no phone", () => {
            const selection = selectionOf(ANA, SIN_TEL);

            expect(selection.selectedWithoutPhone).toEqual([SIN_TEL]);
        });

        it("stops naming a client once it is unselected", () => {
            const selection = selectionOf(ANA, SIN_TEL);

            selection.toggle("3");

            expect(selection.selectedWithoutPhone).toEqual([]);
        });

        it("treats a blank phone as no phone", () => {
            const blank = { _id: "4", name: "Dani", phone: "   " };
            const selection = selectionOf(ANA, blank);

            expect(selection.selectedWithoutPhone).toEqual([blank]);
        });

        it("counts how many will actually be reached", () => {
            const selection = selectionOf(ANA, BETO, SIN_TEL);

            expect(selection.reachableCount).toBe(2);
        });
    });

    /**
     * The backend rejects a send where every recipient is unreachable, so the
     * send button must be blocked before the request is made.
     */
    describe("deciding whether a send is possible", () => {
        it("allows sending when at least one selected client has a phone", () => {
            expect(selectionOf(ANA, SIN_TEL).canSend).toBeTrue();
        });

        it("blocks sending when nothing is selected", () => {
            const selection = selectionOf(ANA, BETO);

            selection.clear();

            expect(selection.canSend).toBeFalse();
        });

        it("blocks sending when every selected client lacks a phone", () => {
            expect(selectionOf(SIN_TEL).canSend).toBeFalse();
        });
    });

    /**
     * A new filter means a new question. Carrying selections over from the
     * previous result set would silently send to people the admin can no
     * longer see, so the list resets to fully selected.
     */
    describe("replacing the candidates after a new filter", () => {
        it("preselects the new candidates", () => {
            const selection = selectionOf(ANA, BETO);
            selection.clear();

            selection.setCandidates([SIN_TEL, ANA]);

            expect(selection.selectedCount).toBe(2);
            expect(selection.candidates).toEqual([SIN_TEL, ANA]);
        });

        it("does not keep an id that is no longer a candidate", () => {
            const selection = selectionOf(ANA, BETO);

            selection.setCandidates([SIN_TEL]);

            expect(selection.selectedIds).toEqual(["3"]);
            expect(selection.isSelected("1")).toBeFalse();
        });

        it("ends up unable to send when the new filter matches nobody", () => {
            const selection = selectionOf(ANA);

            selection.setCandidates([]);

            expect(selection.canSend).toBeFalse();
            expect(selection.selectedCount).toBe(0);
        });
    });
});

/**
 * The clients endpoint nests the phone under userInfo and may omit it. This
 * flattens that into the shape the selection and the template consume.
 */
describe("toRecipientCandidates", () => {
    it("flattens the client shape the api returns", () => {
        const candidates = toRecipientCandidates([
            { _id: "1", email: "ana@mail.com", userInfo: { name: "Ana Perez", phone: "099123456" } },
        ] as never);

        expect(candidates).toEqual([{ _id: "1", name: "Ana Perez", phone: "099123456" }]);
    });

    it("falls back to the email when the client has no name", () => {
        const candidates = toRecipientCandidates([
            { _id: "1", email: "ana@mail.com", userInfo: {} },
        ] as never);

        expect(candidates[0].name).toBe("ana@mail.com");
    });

    it("reports a missing phone as null", () => {
        const candidates = toRecipientCandidates([
            { _id: "1", email: "ana@mail.com", userInfo: { name: "Ana" } },
        ] as never);

        expect(candidates[0].phone).toBeNull();
    });

    it("survives a client with no userInfo at all", () => {
        const candidates = toRecipientCandidates([{ _id: "1", email: "ana@mail.com" }] as never);

        expect(candidates).toEqual([{ _id: "1", name: "ana@mail.com", phone: null }]);
    });

    it("uses the id as a last resort label", () => {
        const candidates = toRecipientCandidates([{ _id: "1" }] as never);

        expect(candidates[0].name).toBe("1");
    });

    it("returns an empty list for no clients", () => {
        expect(toRecipientCandidates([])).toEqual([]);
    });
});
