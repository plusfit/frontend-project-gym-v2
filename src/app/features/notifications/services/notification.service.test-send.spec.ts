import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { environment } from "../../../../environments/environment";
import { NotificationService } from "./notification.service";

/**
 * The test send: the campaign body, but to the admin's own phone, so a typo is
 * caught on one handset instead of on the whole client list.
 */
describe("NotificationService.sendTestMessage", () => {
    const URL = `${environment.api}/notifications/test-send`;

    let service: NotificationService;
    let http: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [NotificationService],
        });

        service = TestBed.inject(NotificationService);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => http.verify());

    it("posts the phone and the message as json", () => {
        service.sendTestMessage("099123456", "Hola Ana").subscribe();

        const request = http.expectOne(URL);

        expect(request.request.method).toBe("POST");
        expect(request.request.body).toEqual({ phone: "099123456", message: "Hola Ana" });
        request.flush({
            success: true,
            data: { jobId: "job-1", status: "queued", scheduledFor: "2026-08-08T16:00:00Z" },
        });
    });

    it("unwraps the api envelope", () => {
        let jobId: string | undefined;
        service.sendTestMessage("099123456", "Hola").subscribe((r) => (jobId = r.jobId));

        http.expectOne(URL).flush({
            success: true,
            data: { jobId: "job-9", status: "queued", scheduledFor: "2026-08-08T16:00:00Z" },
        });

        expect(jobId).toBe("job-9");
    });
});
