import {
    RecipientCandidate,
    RecipientSelection,
    toRecipientCandidates,
} from "./recipient-selection";

/**
 * Selection state for the file-less bulk send. The admin filters the client
 * list, ticks who is in, confirms and sends. Clients with no phone on record
 * are surfaced here so the warning appears before sending, not in the response.
 */
describe("RecipientSelection", () => {
    const ANA: RecipientCandidate = { _id: "1", name: "Ana Perez", phone: "099123456" };
    const BETO: RecipientCandidate = { _id: "2", name: "Beto Diaz", phone: "099123457" };
    const SIN_TEL: RecipientCandidate = { _id: "3", name: "Caro Sosa", phone: null };

    /** Nothing is ever selected on arrival; the admin does the choosing. */
    function selectionOf(...candidates: RecipientCandidate[]) {
        return new RecipientSelection(candidates);
    }

    /** The common "and the admin ticked them all" starting point. */
    function allSelectedOf(...candidates: RecipientCandidate[]) {
        const selection = new RecipientSelection(candidates);
        selection.selectAllVisible();
        return selection;
    }

    /**
     * A bulk sender must never start with recipients already chosen: an admin
     * who opens the modal, filters and hits send without reading the list would
     * message everyone the filter matched.
     */
    describe("default state", () => {
        it("selects nobody on arrival", () => {
            const selection = selectionOf(ANA, BETO);

            expect(selection.selectedCount).toBe(0);
            expect(selection.noneSelected).toBeTrue();
            expect(selection.allSelected).toBeFalse();
            expect(selection.canSend).toBeFalse();
        });

        it("starts empty when there are no candidates", () => {
            const selection = new RecipientSelection([]);

            expect(selection.selectedCount).toBe(0);
            expect(selection.canSend).toBeFalse();
        });
    });

    describe("toggling", () => {
        it("selects a candidate that was not selected", () => {
            const selection = selectionOf(ANA, BETO);

            selection.toggle("1");

            expect(selection.isSelected("1")).toBeTrue();
            expect(selection.selectedCount).toBe(1);
        });

        it("unselects a candidate that was selected", () => {
            const selection = allSelectedOf(ANA, BETO);

            selection.toggle("1");

            expect(selection.isSelected("1")).toBeFalse();
            expect(selection.selectedCount).toBe(1);
            expect(selection.allSelected).toBeFalse();
        });

        it("ignores an id that is not a candidate", () => {
            const selection = selectionOf(ANA);

            selection.toggle("does-not-exist");

            expect(selection.selectedCount).toBe(0);
            expect(selection.isSelected("does-not-exist")).toBeFalse();
        });

        it("clears every selection", () => {
            const selection = allSelectedOf(ANA, BETO);

            selection.clear();

            expect(selection.selectedCount).toBe(0);
            expect(selection.noneSelected).toBeTrue();
        });

        it("selects every visible candidate at once", () => {
            const selection = selectionOf(ANA, BETO);

            selection.selectAllVisible();

            expect(selection.selectedCount).toBe(2);
            expect(selection.allSelected).toBeTrue();
        });
    });

    describe("reporting the selection", () => {
        it("lists the selected ids in selection order", () => {
            const selection = allSelectedOf(ANA, BETO, SIN_TEL);

            selection.toggle("2");

            expect(selection.selectedIds).toEqual(["1", "3"]);
        });

        it("reports neither all nor none while partially selected", () => {
            const selection = allSelectedOf(ANA, BETO);

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
            const selection = allSelectedOf(ANA, SIN_TEL);

            expect(selection.selectedWithoutPhone).toEqual([SIN_TEL]);
        });

        it("stops naming a client once it is unselected", () => {
            const selection = allSelectedOf(ANA, SIN_TEL);

            selection.toggle("3");

            expect(selection.selectedWithoutPhone).toEqual([]);
        });

        it("treats a blank phone as no phone", () => {
            const blank = { _id: "4", name: "Dani", phone: "   " };
            const selection = allSelectedOf(ANA, blank);

            expect(selection.selectedWithoutPhone).toEqual([blank]);
        });

        it("counts how many will actually be reached", () => {
            const selection = allSelectedOf(ANA, BETO, SIN_TEL);

            expect(selection.reachableCount).toBe(2);
        });
    });

    /**
     * The backend rejects a send where every recipient is unreachable, so the
     * send button must be blocked before the request is made.
     */
    describe("deciding whether a send is possible", () => {
        it("allows sending when at least one selected client has a phone", () => {
            expect(allSelectedOf(ANA, SIN_TEL).canSend).toBeTrue();
        });

        it("blocks sending when nothing is selected", () => {
            expect(selectionOf(ANA, BETO).canSend).toBeFalse();
        });

        it("blocks sending when every selected client lacks a phone", () => {
            expect(allSelectedOf(SIN_TEL).canSend).toBeFalse();
        });
    });

    /**
     * The selection is a basket, not a view of the current filter: searching
     * for a second person must not drop the first one.
     */
    describe("replacing the candidates after a new filter", () => {
        it("keeps a selection made in a previous result set", () => {
            const selection = selectionOf(ANA, BETO);
            selection.toggle("1");

            selection.setCandidates([SIN_TEL]);

            expect(selection.isSelected("1")).toBeTrue();
            expect(selection.selectedIds).toEqual(["1"]);
        });

        it("adds a selection from the new result set to the previous one", () => {
            const selection = selectionOf(ANA, BETO);
            selection.toggle("1");

            selection.setCandidates([SIN_TEL]);
            selection.toggle("3");

            expect(selection.selectedIds).toEqual(["1", "3"]);
            expect(selection.selectedCount).toBe(2);
        });

        it("brings the new candidates in unselected", () => {
            const selection = new RecipientSelection([]);

            selection.setCandidates([ANA, BETO]);

            expect(selection.selectedCount).toBe(0);
            expect(selection.candidates).toEqual([ANA, BETO]);
        });

        /**
         * A client selected under a previous filter is invisible in the current
         * one, so its name and phone must survive or the review step would show
         * a smaller batch than what actually ships.
         */
        it("still resolves a selected client that the current filter hides", () => {
            const selection = allSelectedOf(ANA, SIN_TEL);

            selection.setCandidates([BETO]);

            expect(selection.selectedCount).toBe(2);
            expect(selection.reachableCount).toBe(1);
            expect(selection.selectedWithoutPhone).toEqual([SIN_TEL]);
        });

        it("counts how many selected clients the current filter hides", () => {
            const selection = allSelectedOf(ANA, BETO);

            selection.setCandidates([ANA]);

            expect(selection.offScreenCount).toBe(1);
        });

        it("reports no hidden selection when everything selected is visible", () => {
            expect(allSelectedOf(ANA, BETO).offScreenCount).toBe(0);
        });

        it("can still send when the new filter matches nobody but the basket is not empty", () => {
            const selection = allSelectedOf(ANA);

            selection.setCandidates([]);

            expect(selection.canSend).toBeTrue();
            expect(selection.selectedCount).toBe(1);
        });
    });

    /**
     * The header checkbox acts on what the admin can see. Wiping the whole
     * basket from a filtered view would silently discard people picked earlier.
     */
    describe("acting on the visible rows only", () => {
        it("clears just the visible rows", () => {
            const selection = allSelectedOf(ANA, BETO);
            selection.setCandidates([BETO]);

            selection.clearVisible();

            expect(selection.isSelected("2")).toBeFalse();
            expect(selection.isSelected("1")).toBeTrue();
        });

        it("selects every visible row without touching the rest", () => {
            const selection = selectionOf(ANA, BETO);
            selection.toggle("2");
            selection.setCandidates([ANA]);

            selection.selectAllVisible();

            expect(selection.selectedIds).toEqual(["2", "1"]);
        });

        it("reports allSelected against the visible rows", () => {
            const selection = allSelectedOf(ANA, BETO);

            selection.setCandidates([SIN_TEL]);

            expect(selection.allSelected).toBeFalse();

            selection.toggle("3");

            expect(selection.allSelected).toBeTrue();
        });

        it("clears the whole basket on demand", () => {
            const selection = allSelectedOf(ANA, BETO);
            selection.setCandidates([SIN_TEL]);
            selection.toggle("3");

            selection.clear();

            expect(selection.selectedCount).toBe(0);
            expect(selection.offScreenCount).toBe(0);
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
