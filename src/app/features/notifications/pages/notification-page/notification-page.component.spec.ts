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
});
