import { Component, EventEmitter, Output } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialogRef } from "@angular/material/dialog";
import { By } from "@angular/platform-browser";
import { of, throwError } from "rxjs";
import {
  WhatsAppConnectionStatus,
  WhatsAppStatusResponse,
} from "../../interface/whatsapp-status.interface";
import { NotificationService } from "../../services/notification.service";
import { BulkSendComponent } from "../bulk-send/bulk-send.component";
import { WhatsAppConnectionComponent } from "../whatsapp-connection/whatsapp-connection.component";
import { NotificationsWhatsappBulkDialogComponent } from "./notifications-whatsapp-bulk-dialog.component";

@Component({
  selector: "app-whatsapp-connection",
  standalone: true,
  template: '<button type="button" (click)="emitConnected()">Conectar mock</button>',
})
class WhatsAppConnectionStubComponent {
  @Output() statusChange = new EventEmitter<WhatsAppStatusResponse>();

  emitConnected(): void {
    this.statusChange.emit({
      status: WhatsAppConnectionStatus.CONNECTED,
      isConnected: true,
    });
  }
}

@Component({
  selector: "app-bulk-send",
  standalone: true,
  template: "<p>Bulk send mock</p>",
})
class BulkSendStubComponent {}

describe("NotificationsWhatsappBulkDialogComponent", () => {
  let fixture: ComponentFixture<NotificationsWhatsappBulkDialogComponent>;
  let service: jasmine.SpyObj<NotificationService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<NotificationsWhatsappBulkDialogComponent>>;

  async function createComponent(statusResponse: WhatsAppStatusResponse) {
    service.getWhatsAppStatus.and.returnValue(of(statusResponse));

    await TestBed.configureTestingModule({
      imports: [NotificationsWhatsappBulkDialogComponent],
      providers: [
        { provide: NotificationService, useValue: service },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    })
      .overrideComponent(NotificationsWhatsappBulkDialogComponent, {
        remove: { imports: [WhatsAppConnectionComponent, BulkSendComponent] },
        add: { imports: [WhatsAppConnectionStubComponent, BulkSendStubComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(NotificationsWhatsappBulkDialogComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(() => {
    service = jasmine.createSpyObj<NotificationService>("NotificationService", [
      "getWhatsAppStatus",
      "logoutWhatsApp",
    ]);
    dialogRef = jasmine.createSpyObj<MatDialogRef<NotificationsWhatsappBulkDialogComponent>>(
      "MatDialogRef",
      ["close"],
    );
    TestBed.resetTestingModule();
  });

  it("shows QR connection guidance, not the send flow, when WhatsApp is disconnected", async () => {
    await createComponent({ status: WhatsAppConnectionStatus.DISCONNECTED, isConnected: false });

    expect(fixture.nativeElement.textContent).toContain("Conectá WhatsApp para el envío masivo");
    expect(fixture.debugElement.query(By.css("app-whatsapp-connection")))
      .withContext("QR connection flow is active")
      .not.toBeNull();
    expect(fixture.debugElement.query(By.css("app-bulk-send"))).toBeNull();
  });

  it("shows the send flow, not QR guidance, when WhatsApp is connected", async () => {
    await createComponent({ status: WhatsAppConnectionStatus.CONNECTED, isConnected: true });

    expect(fixture.nativeElement.textContent).toContain("Listo para enviar mensajes");
    expect(fixture.debugElement.query(By.css("app-bulk-send")))
      .withContext("bulk send flow is active")
      .not.toBeNull();
    expect(fixture.debugElement.query(By.css("app-whatsapp-connection"))).toBeNull();
  });

  it("lets staff disconnect the active WhatsApp session from the connected modal state", async () => {
    service.logoutWhatsApp.and.returnValue(of({ message: "Sesión cerrada" }));
    await createComponent({ status: WhatsAppConnectionStatus.CONNECTED, isConnected: true });

    const disconnectButton = fixture.debugElement.query(By.css("button[aria-label='Desconectar']"));
    disconnectButton.triggerEventHandler("click");
    fixture.detectChanges();

    expect(service.logoutWhatsApp).toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain("Conectá WhatsApp para el envío masivo");
    expect(fixture.debugElement.query(By.css("app-whatsapp-connection"))).not.toBeNull();
  });

  it("uses concise connected-state copy without the removed CSV progress subtitle", async () => {
    await createComponent({ status: WhatsAppConnectionStatus.CONNECTED, isConnected: true });

    const textContent = fixture.nativeElement.textContent;
    const disconnectButton = fixture.debugElement.query(By.css("button[aria-label='Desconectar']"));

    expect(textContent).not.toContain("Subí el CSV y seguí el progreso");
    expect(disconnectButton.nativeElement.textContent.trim()).toBe("Desconectar");
  });

  it("updates from connection guidance to the send flow when child status changes", async () => {
    await createComponent({ status: WhatsAppConnectionStatus.QR_READY, isConnected: false });

    const child = fixture.debugElement.query(By.directive(WhatsAppConnectionStubComponent))
      .componentInstance as WhatsAppConnectionStubComponent;
    child.emitConnected();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("Listo para enviar mensajes");
    expect(fixture.debugElement.query(By.css("app-bulk-send"))).not.toBeNull();
  });

  it("keeps an understandable error state when status cannot load", async () => {
    service.getWhatsAppStatus.and.returnValue(throwError(() => new Error("network down")));

    await TestBed.configureTestingModule({
      imports: [NotificationsWhatsappBulkDialogComponent],
      providers: [
        { provide: NotificationService, useValue: service },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    })
      .overrideComponent(NotificationsWhatsappBulkDialogComponent, {
        remove: { imports: [WhatsAppConnectionComponent, BulkSendComponent] },
        add: { imports: [WhatsAppConnectionStubComponent, BulkSendStubComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(NotificationsWhatsappBulkDialogComponent);
    fixture.detectChanges();

    const alert = fixture.debugElement.query(By.css("[role='alert']"));
    expect(alert.nativeElement.textContent).toContain("No pudimos leer el estado de WhatsApp");
    expect(fixture.debugElement.query(By.css("app-bulk-send"))).toBeNull();
  });

  it("closes the modal from the accessible close action", async () => {
    await createComponent({ status: WhatsAppConnectionStatus.CONNECTED, isConnected: true });

    const closeButton = fixture.debugElement.query(
      By.css("button[aria-label='Cerrar modal de envío masivo por WhatsApp']"),
    );
    closeButton.triggerEventHandler("click");

    expect(dialogRef.close).toHaveBeenCalled();
  });
});
