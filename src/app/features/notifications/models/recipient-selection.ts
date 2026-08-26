/** A client the admin can pick for a bulk send, flattened for the template. */
export interface RecipientCandidate {
    _id: string;
    name: string;
    /** null when the client has no usable phone on record. */
    phone: string | null;
}

/** Shape the clients endpoint returns; every field may be absent. */
interface ClientLike {
    _id: string;
    email?: string;
    userInfo?: { name?: string; phone?: string };
}

const hasPhone = (candidate: RecipientCandidate): boolean =>
    typeof candidate.phone === "string" && candidate.phone.trim() !== "";

/**
 * Flattens the nested client shape into candidates, falling back through name,
 * email and id so a row is never rendered without a label.
 */
export const toRecipientCandidates = (clients: ClientLike[]): RecipientCandidate[] =>
    (clients ?? []).map((client) => ({
        _id: client._id,
        name: client.userInfo?.name?.trim() || client.email || client._id,
        phone: client.userInfo?.phone?.trim() ? client.userInfo.phone : null,
    }));

/**
 * Who receives the next bulk message.
 *
 * The selection is a basket, not a view of the current filter: picking someone,
 * searching for a second person and picking them too must end with both in the
 * batch. Every candidate ever seen is therefore remembered, so a client the
 * current filter hides still resolves to a name and a phone.
 *
 * Nothing is ever selected by default — see setCandidates.
 *
 * Clients with no phone stay visible and selectable so the admin sees them, but
 * they are reported separately: the notifications service rejects a batch whose
 * recipients are all unreachable, so canSend must know the difference.
 */
export class RecipientSelection {
    private candidateList: RecipientCandidate[] = [];
    private selectedIdSet = new Set<string>();
    /** Every candidate ever loaded, so an off-screen pick stays resolvable. */
    private knownById = new Map<string, RecipientCandidate>();

    constructor(candidates: RecipientCandidate[] = []) {
        this.setCandidates(candidates);
    }

    get candidates(): RecipientCandidate[] {
        return this.candidateList;
    }

    /**
     * Replaces the visible result set, keeping the basket intact.
     *
     * New rows always arrive unticked. Nothing is ever selected on the admin's
     * behalf: in a bulk sender an unnoticed preselection is a campaign sent to
     * people nobody chose, so every recipient must be an explicit act.
     */
    setCandidates(candidates: RecipientCandidate[]): void {
        this.candidateList = candidates ?? [];

        for (const candidate of this.candidateList) {
            this.knownById.set(candidate._id, candidate);
        }
    }

    toggle(id: string): void {
        if (!this.knownById.has(id)) return;

        if (this.selectedIdSet.has(id)) {
            this.selectedIdSet.delete(id);
            return;
        }

        this.selectedIdSet.add(id);
    }

    /** Ticks the rows on screen; picks made under other filters are untouched. */
    selectAllVisible(): void {
        for (const candidate of this.candidateList) {
            this.selectedIdSet.add(candidate._id);
        }
    }

    /** Unticks the rows on screen only — the header checkbox governs the view. */
    clearVisible(): void {
        for (const candidate of this.candidateList) {
            this.selectedIdSet.delete(candidate._id);
        }
    }

    /** Empties the whole basket, including picks the current filter hides. */
    clear(): void {
        this.selectedIdSet.clear();
    }

    isSelected(id: string): boolean {
        return this.selectedIdSet.has(id);
    }

    /** Derived from what is known, so a stale id can never leak out. */
    get selectedIds(): string[] {
        return this.selectedCandidates.map((candidate) => candidate._id);
    }

    get selectedCount(): number {
        return this.selectedCandidates.length;
    }

    /** Picks the current filter hides, so the batch is never bigger than it looks. */
    get offScreenCount(): number {
        const visible = new Set(this.candidateList.map((candidate) => candidate._id));
        return this.selectedIds.filter((id) => !visible.has(id)).length;
    }

    get allSelected(): boolean {
        return (
            this.candidateList.length > 0 &&
            this.candidateList.every((candidate) => this.selectedIdSet.has(candidate._id))
        );
    }

    get noneSelected(): boolean {
        return !this.candidateList.some((candidate) => this.selectedIdSet.has(candidate._id));
    }

    /** Surfaced before sending so nothing looks silently dropped afterwards. */
    get selectedWithoutPhone(): RecipientCandidate[] {
        return this.selectedCandidates.filter((candidate) => !hasPhone(candidate));
    }

    get selectedReachable(): RecipientCandidate[] {
        return this.selectedCandidates.filter(hasPhone);
    }

    get reachableCount(): number {
        return this.selectedReachable.length;
    }

    get canSend(): boolean {
        return this.reachableCount > 0;
    }

    /** Selection order, so the batch reads the way it was assembled. */
    private get selectedCandidates(): RecipientCandidate[] {
        return [...this.selectedIdSet]
            .map((id) => this.knownById.get(id))
            .filter((candidate): candidate is RecipientCandidate => candidate !== undefined);
    }
}
