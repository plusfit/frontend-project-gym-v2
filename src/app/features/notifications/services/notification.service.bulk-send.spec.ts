import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { environment } from "../../../../environments/environment";
import { BulkSendResponse } from "../interface/bulk-status.interface";
import { NotificationService } from "./notification.service";

/**
 * The file-less bulk send. Posts the selected client ids and the message; the
 * backend resolves the phones, so no file is built, uploaded or parsed.
 */
describe("NotificationService.sendBulkMessage", () => {
    const URL = `${environment.api}/notifications/bulk-send`;
    const CAMPAIGN = ["*PLUSFIT A CORRER!!!*", "", "- Todos vamos por los 7 km"].join("\n");

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

    function respondWith(data: Partial<BulkSendResponse>) {
        const request = http.expectOne(URL);
        request.flush({
            success: true,
            data: { batchId: "batch-1", total: 1, requested: 1, skipped: [], ...data },
        });
        return request;
    }

    it("posts the selected ids and the message as json", () => {
        service.sendBulkMessage(["id-1", "id-2"], "Hola").subscribe();

        const request = http.expectOne(URL);

        expect(request.request.method).toBe("POST");
        expect(request.request.body).toEqual({ clientIds: ["id-1", "id-2"], message: "Hola" });
        request.flush({ success: true, data: { batchId: "b", total: 2, requested: 2, skipped: [] } });
    });

    it("sends the message body untouched, line breaks included", () => {
        service.sendBulkMessage(["id-1"], CAMPAIGN).subscribe();

        const request = http.expectOne(URL);

        expect(request.request.body.message).toBe(CAMPAIGN);
        request.flush({ success: true, data: { batchId: "b", total: 1, requested: 1, skipped: [] } });
    });

    it("unwraps the api envelope", () => {
        let result: BulkSendResponse | undefined;
        service.sendBulkMessage(["id-1"], "Hola").subscribe((value) => (result = value));

        respondWith({ batchId: "batch-9", total: 1, requested: 1 });

        expect(result).toEqual({ batchId: "batch-9", total: 1, requested: 1, skipped: [] });
    });

    it("surfaces the clients the backend could not reach", () => {
        let result: BulkSendResponse | undefined;
        service.sendBulkMessage(["id-1", "id-2"], "Hola").subscribe((value) => (result = value));

        respondWith({
            total: 1,
            requested: 2,
            skipped: [{ clientId: "id-2", name: "Juan Gomez", reason: "no_phone" }],
        });

        expect(result?.skipped).toEqual([
            { clientId: "id-2", name: "Juan Gomez", reason: "no_phone" },
        ]);
    });

    it("does not build or upload any file", () => {
        service.sendBulkMessage(["id-1"], "Hola").subscribe();

        const request = http.expectOne(URL);

        expect(request.request.body instanceof FormData).toBeFalse();
        request.flush({ success: true, data: { batchId: "b", total: 1, requested: 1, skipped: [] } });
    });
});
