import { CanDeactivateFn } from "@angular/router";
import { Observable } from "rxjs";
import { WhatsappBulkPageComponent } from "../pages/whatsapp-bulk-page/whatsapp-bulk-page.component";

/**
 * Keeps a half-written campaign from disappearing on a browser back.
 *
 * The recipients and the message never leave the component, so navigating away
 * is destructive in a way the browser gives no warning about. The page owns the
 * question because only it can see whether there is a draft at all.
 */
export const whatsappBulkDraftGuard: CanDeactivateFn<WhatsappBulkPageComponent> = (
    component,
): boolean | Observable<boolean> => component.canDeactivate();
