import { WhatsappBulkPageComponent } from "../pages/whatsapp-bulk-page/whatsapp-bulk-page.component";
import { whatsappBulkDraftGuard } from "./whatsapp-bulk-draft.guard";

/**
 * Recipients and message never leave the page, so a browser back would drop a
 * campaign without a word. The guard is the only thing standing between the
 * two.
 */
describe("whatsappBulkDraftGuard", () => {
    function run(canDeactivate: () => boolean) {
        const component = { canDeactivate } as WhatsappBulkPageComponent;

        return whatsappBulkDraftGuard(
            component,
            {} as never,
            {} as never,
            {} as never,
        );
    }

    it("lets the page go when it reports nothing to lose", () => {
        expect(run(() => true)).toBeTrue();
    });

    it("blocks the navigation when the page keeps a draft", () => {
        expect(run(() => false)).toBeFalse();
    });
});
