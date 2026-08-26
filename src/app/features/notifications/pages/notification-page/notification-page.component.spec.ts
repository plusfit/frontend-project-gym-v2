import { ElementRef } from "@angular/core";
import { NotificationPageComponent } from "./notification-page.component";

describe("NotificationPageComponent", () => {
    function createComponent() {
        const router = jasmine.createSpyObj("Router", ["navigate"]);
        const dialog = jasmine.createSpyObj("MatDialog", ["open"]);
        const component = new NotificationPageComponent(
            {} as never,
            {} as never,
            router,
            dialog,
            {} as never,
        );

        return { component, router, dialog };
    }

    /**
     * The bulk send is a route, not a modal: it spans four steps and a batch
     * that runs for minutes, so it has to survive a refresh and be linkable.
     */
    it("navigates to the bulk send page instead of opening a dialog", () => {
        const { component, router, dialog } = createComponent();

        component.goToWhatsappBulkPage();

        expect(router.navigate).toHaveBeenCalledWith(["/notificaciones/envio-masivo"]);
        expect(dialog.open).not.toHaveBeenCalled();
    });

    it("keeps notification table configuration unchanged when the entry point is used", () => {
        const { component } = createComponent();

        component.goToWhatsappBulkPage();

        expect(component.displayedColumns).toEqual([
            "name",
            "reason",
            "phone",
            "status",
            "createdAt",
            "acciones",
        ]);
        expect(component.pageSize).toBeGreaterThan(0);
    });

    describe("focus on return from the bulk send page", () => {
        let trigger: HTMLButtonElement;

        beforeEach(() => {
            trigger = document.createElement("button");
            document.body.appendChild(trigger);
        });

        afterEach(() => {
            trigger.remove();
            history.replaceState({}, "");
        });

        function mountTrigger(component: NotificationPageComponent) {
            component.bulkTrigger = new ElementRef(trigger);
        }

        /**
         * The dialog this flow replaced restored focus on close. A route change
         * leaves focus on the document, so the keyboard lands back at the top of
         * the page instead of where the journey started.
         */
        it("focuses the bulk send trigger when returning from the bulk page", () => {
            const { component } = createComponent();
            mountTrigger(component);
            history.replaceState({ focusBulkTrigger: true }, "");

            component.ngAfterViewInit();

            expect(document.activeElement).toBe(trigger);
        });

        it("leaves focus alone on a plain visit to the notifications list", () => {
            const { component } = createComponent();
            mountTrigger(component);
            history.replaceState({}, "");

            component.ngAfterViewInit();

            expect(document.activeElement).not.toBe(trigger);
        });
    });
});
