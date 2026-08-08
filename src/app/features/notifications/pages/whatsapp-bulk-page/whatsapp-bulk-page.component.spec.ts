import { Component, EventEmitter, Output } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { By } from "@angular/platform-browser";
import { of, throwError } from "rxjs";
import { BulkSendComponent } from "../../components/bulk-send/bulk-send.component";
import { WhatsAppConnectionComponent } from "../../components/whatsapp-connection/whatsapp-connection.component";
import {
    WhatsAppConnectionStatus,
    WhatsAppStatusResponse,
} from "../../interface/whatsapp-status.interface";
import { NotificationService } from "../../services/notification.service";
import { WhatsappBulkPageComponent } from "./whatsapp-bulk-page.component";

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

/**
 * The bulk send used to live in a modal. It is a four-step flow with a live
 * preview and a batch that runs for minutes, so it earns its own route: a
 * refresh, a back button or a shared link must all land somewhere real.
 */
describe("WhatsappBulkPageComponent", () => {
    let fixture: ComponentFixture<WhatsappBulkPageComponent>;
    let service: jasmine.SpyObj<NotificationService>;
    let router: jasmine.SpyObj<Router>;

    async function configure() {
        await TestBed.configureTestingModule({
            imports: [WhatsappBulkPageComponent],
            providers: [
                { provide: NotificationService, useValue: service },
                { provide: Router, useValue: router },
            ],
        })
            .overrideComponent(WhatsappBulkPageComponent, {
                remove: { imports: [WhatsAppConnectionComponent, BulkSendComponent] },
                add: { imports: [WhatsAppConnectionStubComponent, BulkSendStubComponent] },
            })
            .compileComponents();
    }

    async function createComponent(statusResponse: WhatsAppStatusResponse) {
        service.getWhatsAppStatus.and.returnValue(of(statusResponse));
        await configure();

        fixture = TestBed.createComponent(WhatsappBulkPageComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(() => {
        service = jasmine.createSpyObj<NotificationService>("NotificationService", [
            "getWhatsAppStatus",
            "logoutWhatsApp",
        ]);
        router = jasmine.createSpyObj<Router>("Router", ["navigate"]);
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

    it("lets staff disconnect the active WhatsApp session", async () => {
        service.logoutWhatsApp.and.returnValue(of({ message: "Sesión cerrada" }));
        await createComponent({ status: WhatsAppConnectionStatus.CONNECTED, isConnected: true });

        const disconnectButton = fixture.debugElement.query(
            By.css("button[aria-label='Desconectar']"),
        );
        disconnectButton.triggerEventHandler("click");
        fixture.detectChanges();

        expect(service.logoutWhatsApp).toHaveBeenCalled();
        expect(fixture.nativeElement.textContent).toContain("Conectá WhatsApp para el envío masivo");
        expect(fixture.debugElement.query(By.css("app-whatsapp-connection"))).not.toBeNull();
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
        await configure();

        fixture = TestBed.createComponent(WhatsappBulkPageComponent);
        fixture.detectChanges();

        const alert = fixture.debugElement.query(By.css("[role='alert']"));
        expect(alert.nativeElement.textContent).toContain("No pudimos leer el estado de WhatsApp");
        expect(fixture.debugElement.query(By.css("app-bulk-send"))).toBeNull();
    });

    /** A page needs a way out that is not the browser's back button. */
    it("returns to the notifications list from the back action", async () => {
        await createComponent({ status: WhatsAppConnectionStatus.CONNECTED, isConnected: true });

        const backButton = fixture.debugElement.query(
            By.css("button[aria-label='Volver a notificaciones']"),
        );
        backButton.triggerEventHandler("click");

        expect(router.navigate).toHaveBeenCalledWith(["/notificaciones"]);
    });
});
