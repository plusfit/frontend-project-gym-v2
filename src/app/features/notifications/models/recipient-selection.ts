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
 * Clients with no phone stay visible and selectable so the admin sees them, but
 * they are reported separately: the notifications service rejects a batch whose
 * recipients are all unreachable, so canSend must know the difference.
 */
export class RecipientSelection {
    private candidateList: RecipientCandidate[] = [];
    private selectedIdSet = new Set<string>();

    constructor(candidates: RecipientCandidate[] = []) {
        this.setCandidates(candidates);
    }

    get candidates(): RecipientCandidate[] {
        return this.candidateList;
    }

    /**
     * Replaces the result set after a new filter and preselects all of it:
     * filtering is already the act of choosing, so an empty selection would
     * make the admin re-tick every row they just filtered for.
     */
    setCandidates(candidates: RecipientCandidate[]): void {
        this.candidateList = candidates ?? [];
        this.selectedIdSet = new Set(this.candidateList.map((candidate) => candidate._id));
    }

    toggle(id: string): void {
        if (!this.candidateList.some((candidate) => candidate._id === id)) return;

        if (this.selectedIdSet.has(id)) {
            this.selectedIdSet.delete(id);
            return;
        }

        this.selectedIdSet.add(id);
    }

    selectAll(): void {
        this.selectedIdSet = new Set(this.candidateList.map((candidate) => candidate._id));
    }

    clear(): void {
        this.selectedIdSet.clear();
    }

    isSelected(id: string): boolean {
        return this.selectedIdSet.has(id);
    }

    /** Derived from the candidate list, so a stale id can never leak out. */
    get selectedIds(): string[] {
        return this.selectedCandidates.map((candidate) => candidate._id);
    }

    get selectedCount(): number {
        return this.selectedCandidates.length;
    }

    get allSelected(): boolean {
        return this.candidateList.length > 0 && this.selectedCount === this.candidateList.length;
    }

    get noneSelected(): boolean {
        return this.selectedCount === 0;
    }

    /** Surfaced before sending so nothing looks silently dropped afterwards. */
    get selectedWithoutPhone(): RecipientCandidate[] {
        return this.selectedCandidates.filter((candidate) => !hasPhone(candidate));
    }

    get reachableCount(): number {
        return this.selectedCandidates.filter(hasPhone).length;
    }

    get canSend(): boolean {
        return this.reachableCount > 0;
    }

    private get selectedCandidates(): RecipientCandidate[] {
        return this.candidateList.filter((candidate) => this.selectedIdSet.has(candidate._id));
    }
}
