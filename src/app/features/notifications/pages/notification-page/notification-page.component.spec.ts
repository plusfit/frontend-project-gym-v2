import { NotificationsWhatsappBulkDialogComponent } from "../../components/notifications-whatsapp-bulk-dialog/notifications-whatsapp-bulk-dialog.component";
import { NotificationPageComponent } from "./notification-page.component";

describe("NotificationPageComponent", () => {
  function createComponent() {
    const dialog = jasmine.createSpyObj("MatDialog", ["open"]);
    const component = new NotificationPageComponent(
      {} as never,
      {} as never,
      {} as never,
      dialog,
      {} as never,
    );

    return { component, dialog };
  }

  it("opens the WhatsApp CSV modal with an accessible dialog configuration", () => {
    const { component, dialog } = createComponent();

    component.openWhatsappBulkDialog();

    expect(dialog.open).toHaveBeenCalledWith(
      NotificationsWhatsappBulkDialogComponent,
      jasmine.objectContaining({
        width: "min(720px, 96vw)",
        maxWidth: "96vw",
        autoFocus: "dialog",
        restoreFocus: true,
        panelClass: "notifications-whatsapp-bulk-dialog-panel",
        ariaLabel: "Envío masivo por WhatsApp desde CSV",
      }),
    );
  });

  it("keeps notification table configuration unchanged when the modal entry point is used", () => {
    const { component } = createComponent();

    component.openWhatsappBulkDialog();

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
