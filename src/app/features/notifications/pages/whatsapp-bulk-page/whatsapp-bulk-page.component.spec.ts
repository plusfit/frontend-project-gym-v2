import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { By } from "@angular/platform-browser";
import { Observable, Subject, of, throwError } from "rxjs";
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
    @Input() initialStatus?: WhatsAppStatusResponse;
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
    let dialog: jasmine.SpyObj<MatDialog>;
    let confirm: EventEmitter<boolean>;
    let afterClosed: Subject<unknown>;

    async function configure() {
        await TestBed.configureTestingModule({
            imports: [WhatsappBulkPageComponent],
            providers: [
                { provide: NotificationService, useValue: service },
                { provide: Router, useValue: router },
                { provide: MatDialog, useValue: dialog },
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

        confirm = new EventEmitter<boolean>();
        afterClosed = new Subject<unknown>();
        dialog = jasmine.createSpyObj<MatDialog>("MatDialog", ["open"]);
        dialog.open.and.returnValue({
            componentInstance: { confirm },
            afterClosed: () => afterClosed.asObservable(),
        } as never);

        TestBed.resetTestingModule();
    });

    /** The stub replaces the real child, so the ViewChild has to be planted. */
    function withDraft(hasUnsavedDraft: boolean) {
        fixture.componentInstance.bulkSend = { hasUnsavedDraft: () => hasUnsavedDraft } as never;
    }

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

        expect(router.navigate).toHaveBeenCalledWith(["/notificaciones"], {
            state: { focusBulkTrigger: true },
        });
    });

    /**
     * The dialog this page replaced had autoFocus. A route change alone moves
     * nothing, leaving a screen reader on the page we just left.
     */
    it("moves focus to the page heading on entry", async () => {
        await createComponent({ status: WhatsAppConnectionStatus.CONNECTED, isConnected: true });

        const heading = fixture.debugElement.query(By.css("h1")).nativeElement as HTMLElement;
        expect(heading.getAttribute("tabindex")).toBe("-1");
        expect(document.activeElement).toBe(heading);
    });

    it("leaves without asking when there is no draft to lose", async () => {
        await createComponent({ status: WhatsAppConnectionStatus.CONNECTED, isConnected: true });
        withDraft(false);

        expect(fixture.componentInstance.canDeactivate()).toBeTrue();
        expect(dialog.open).not.toHaveBeenCalled();
    });

    it("stays on the page when the admin declines to discard the draft", async () => {
        await createComponent({ status: WhatsAppConnectionStatus.CONNECTED, isConnected: true });
        withDraft(true);

        const answers: boolean[] = [];
        (fixture.componentInstance.canDeactivate() as Observable<boolean>).subscribe((answer) =>
            answers.push(answer),
        );
        confirm.emit(false);

        expect(dialog.open).toHaveBeenCalled();
        expect(answers).toEqual([false]);
    });

    it("leaves once the admin confirms discarding the draft", async () => {
        await createComponent({ status: WhatsAppConnectionStatus.CONNECTED, isConnected: true });
        withDraft(true);

        const answers: boolean[] = [];
        (fixture.componentInstance.canDeactivate() as Observable<boolean>).subscribe((answer) =>
            answers.push(answer),
        );
        confirm.emit(true);

        expect(answers).toEqual([true]);
    });

    /** Escape and backdrop clicks never reach confirm; silence must mean stay. */
    it("keeps the draft when the confirmation is dismissed without an answer", async () => {
        await createComponent({ status: WhatsAppConnectionStatus.CONNECTED, isConnected: true });
        withDraft(true);

        const answers: boolean[] = [];
        (fixture.componentInstance.canDeactivate() as Observable<boolean>).subscribe((answer) =>
            answers.push(answer),
        );
        afterClosed.next(undefined);

        expect(answers).toEqual([false]);
    });

    /**
     * The page asks for the status on init; the connection panel used to ask
     * again the moment it mounted, for an answer already on screen.
     */
    it("hands its own status to the connection panel instead of a second fetch", async () => {
        await createComponent({ status: WhatsAppConnectionStatus.QR_READY, isConnected: false });

        const child = fixture.debugElement.query(By.directive(WhatsAppConnectionStubComponent))
            .componentInstance as WhatsAppConnectionStubComponent;

        expect(service.getWhatsAppStatus).toHaveBeenCalledTimes(1);
        expect(child.initialStatus).toEqual({
            status: WhatsAppConnectionStatus.QR_READY,
            isConnected: false,
        });
    });

    /** A status we failed to read is worth nothing to the panel. */
    it("withholds the seed when its own status read failed", async () => {
        service.getWhatsAppStatus.and.returnValue(throwError(() => new Error("network down")));
        await configure();

        fixture = TestBed.createComponent(WhatsappBulkPageComponent);
        fixture.detectChanges();

        const child = fixture.debugElement.query(By.directive(WhatsAppConnectionStubComponent))
            .componentInstance as WhatsAppConnectionStubComponent;

        expect(child.initialStatus).toBeUndefined();
    });

    /**
     * A getter returning a fresh object literal on every template read trips
     * ExpressionChangedAfterItHasBeenCheckedError while the panel is
     * rendered. The seed must be the same reference across consecutive reads
     * when nothing about the status changed.
     */
    it("returns the same connectionSeed reference across consecutive reads while status is unchanged", async () => {
        await createComponent({ status: WhatsAppConnectionStatus.QR_READY, isConnected: false });

        const firstRead = fixture.componentInstance.connectionSeed;
        const secondRead = fixture.componentInstance.connectionSeed;
        fixture.detectChanges();
        const thirdRead = fixture.componentInstance.connectionSeed;

        expect(firstRead).toBe(secondRead);
        expect(firstRead).toBe(thirdRead);
    });

    /**
     * canDeactivate() can fire again (e.g. two rapid navigation attempts)
     * before the first confirmation dialog settles. The second call must not
     * open an orphaned second dialog, and both callers must see the same
     * answer.
     */
    it("does not stack a second dialog when a confirmation is already pending", async () => {
        await createComponent({ status: WhatsAppConnectionStatus.CONNECTED, isConnected: true });
        withDraft(true);

        const firstAnswers: boolean[] = [];
        const secondAnswers: boolean[] = [];
        (fixture.componentInstance.canDeactivate() as Observable<boolean>).subscribe((answer) =>
            firstAnswers.push(answer),
        );
        (fixture.componentInstance.canDeactivate() as Observable<boolean>).subscribe((answer) =>
            secondAnswers.push(answer),
        );

        expect(dialog.open).toHaveBeenCalledTimes(1);

        confirm.emit(true);

        expect(firstAnswers).toEqual([true]);
        expect(secondAnswers).toEqual([true]);
    });
});
