import { ChangeDetectorRef } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Store } from "@ngxs/store";
import { of, throwError } from "rxjs";
import { WhatsAppConnectionStatus } from "../../interface/whatsapp-status.interface";
import { NotificationService } from "../../services/notification.service";
import { WhatsAppConnectionComponent } from "./whatsapp-connection.component";

describe("WhatsAppConnectionComponent", () => {
  let service: jasmine.SpyObj<NotificationService>;
  let component: WhatsAppConnectionComponent;
  let emittedStatuses: unknown[];

  beforeEach(() => {
    service = jasmine.createSpyObj<NotificationService>("NotificationService", [
      "getWhatsAppStatus",
      "logoutWhatsApp",
    ]);
    component = new WhatsAppConnectionComponent(
      service,
      { detectChanges: jasmine.createSpy("detectChanges") } as unknown as ChangeDetectorRef,
      { selectSnapshot: () => "token" } as unknown as Store,
      { open: jasmine.createSpy("open") } as unknown as MatSnackBar,
    );
    emittedStatuses = [];
    component.statusChange.subscribe((status: unknown) => emittedStatuses.push(status));
  });

  it("emits loaded WhatsApp status changes for the parent dialog", () => {
    service.getWhatsAppStatus.and.returnValue(
      of({ status: WhatsAppConnectionStatus.CONNECTED, isConnected: true }),
    );

    component.ngOnInit();

    expect(emittedStatuses).toEqual([
      { status: WhatsAppConnectionStatus.CONNECTED, isConnected: true, error: undefined },
    ]);
    expect(component.statusDescriptor.label).toBe("Conectado");
    expect(component.statusDescriptor.cssClass).toBe("connected");
  });

  /**
   * The bulk send page reads the status before it mounts this panel. Asking
   * again for an answer already on screen is a request nobody needs.
   */
  it("starts from the status the host already fetched instead of asking again", () => {
    const eventSources: FakeEventSource[] = [];
    (window as unknown as { EventSource: new (url: string) => FakeEventSource }).EventSource =
      class extends FakeEventSource {
        constructor(url: string) {
          super(url);
          eventSources.push(this);
        }
      };
    service.getWhatsAppStatus.and.returnValue(
      of({ status: WhatsAppConnectionStatus.QR_READY, isConnected: false }),
    );
    component.initialStatus = {
      status: WhatsAppConnectionStatus.QR_READY,
      isConnected: false,
    };

    component.ngOnInit();

    expect(service.getWhatsAppStatus).not.toHaveBeenCalled();
    expect(component.statusDescriptor.label).toBe("QR listo para escanear");
    expect(emittedStatuses).toEqual([
      { status: WhatsAppConnectionStatus.QR_READY, isConnected: false, error: undefined },
    ]);
    // A skipped fetch must not mean a skipped QR stream: it is still the only
    // way the code reaches the screen.
    expect(eventSources.length).toBe(1);

    component.ngOnDestroy();
  });

  it("keeps fetching for itself when no status is handed down", () => {
    (window as unknown as { EventSource: new (url: string) => FakeEventSource }).EventSource =
      FakeEventSource;
    service.getWhatsAppStatus.and.returnValue(
      of({ status: WhatsAppConnectionStatus.DISCONNECTED, isConnected: false }),
    );

    component.ngOnInit();

    expect(service.getWhatsAppStatus).toHaveBeenCalledTimes(1);

    component.ngOnDestroy();
  });

  it("emits QR-ready status when the SSE QR payload arrives", () => {
    const eventSources: FakeEventSource[] = [];
    (window as unknown as { EventSource: new (url: string) => FakeEventSource }).EventSource =
      class extends FakeEventSource {
        constructor(url: string) {
          super(url);
          eventSources.push(this);
        }
      };

    component.startQrListener();
    eventSources[0].emitMessage(JSON.stringify({ qr: "qr-token" }));

    expect(emittedStatuses).toEqual([
      { status: WhatsAppConnectionStatus.QR_READY, isConnected: false, error: undefined },
    ]);
    expect(component.getQrImageUrl()).toContain(encodeURIComponent("qr-token"));
  });

  it("closes QR listener and polling streams on destroy", () => {
    const eventSources: FakeEventSource[] = [];
    (window as unknown as { EventSource: new (url: string) => FakeEventSource }).EventSource =
      class extends FakeEventSource {
        constructor(url: string) {
          super(url);
          eventSources.push(this);
        }
      };

    component.startQrListener();
    component.ngOnDestroy();

    expect(eventSources[0].closed).toBeTrue();
  });

  it("emits an understandable error status when loading fails", () => {
    service.getWhatsAppStatus.and.returnValue(throwError(() => new Error("network down")));

    component.ngOnInit();

    expect(emittedStatuses).toEqual([
      {
        status: WhatsAppConnectionStatus.ERROR,
        isConnected: false,
        error: "Error al cargar estado: network down",
      },
    ]);
  });
});

class FakeEventSource {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  closed = false;

  constructor(public url: string) {}

  emitMessage(data: string): void {
    this.onmessage?.({ data } as MessageEvent);
  }

  close(): void {
    this.closed = true;
  }
}
