import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../../../environments/environment";
import { NotificationReason, NotificationStatus } from "../enums/notifications.enum";
import { ApiEnvelope, BulkStatusResponse, BulkUploadResponse } from "../interface/bulk-status.interface";
import { WhatsAppStatusApiResponse, WhatsAppStatusResponse } from "../interface/whatsapp-status.interface";

@Injectable({
    providedIn: "root",
})
export class NotificationService {
    constructor(private http: HttpClient) {}

    getNotifications(page: number, limit: number): Observable<any> {
        const url = `/notifications?page=${page}&limit=${limit}`;
        return this.http.get<any>(`${environment.api}${url}`);
    }

    getNotificationById(id: string): Observable<any> {
        return this.http.get<any>(`${environment.api}/notifications/${id}`);
    }

    getNotificationsByFilters(
        page: number,
        limit: number,
        searchQ?: string,
        status?: NotificationStatus | "",
        reason?: NotificationReason,
    ): Observable<any> {
        let params = new HttpParams().set("page", page.toString()).set("limit", limit.toString());

        if (searchQ) {
            params = params.set("searchQ", searchQ);
        }

        if (status) {
            params = params.set("status", status);
        }

        if (reason) {
            params = params.set("reason", reason);
        }

        return this.http.get<any>(`${environment.api}/notifications`, {
            params,
        });
    }

    updateNotificationStatus(id: string, status: NotificationStatus): Observable<any> {
        return this.http.patch<any>(`${environment.api}/notifications/${id}`, {
            status,
        });
    }

    deleteNotification(id: string): Observable<any> {
        return this.http.delete<any>(`${environment.api}/notifications/${id}`);
    }

    uploadBulkCSV(file: File): Observable<BulkUploadResponse> {
        const formData = new FormData();
        formData.append("file", file);
        return this.http
            .post<ApiEnvelope<BulkUploadResponse>>(
                `${environment.api}/notifications/bulk-upload`,
                formData,
            )
            .pipe(map((response) => response.data));
    }

    getBulkStatus(batchId: string): Observable<BulkStatusResponse> {
        return this.http
            .get<ApiEnvelope<BulkStatusResponse>>(
                `${environment.api}/notifications/bulk-status/${batchId}`,
            )
            .pipe(map((response) => response.data));
    }

    getWhatsAppStatus(): Observable<WhatsAppStatusResponse> {
        return this.http.get<WhatsAppStatusApiResponse>(
            `${environment.api}/whatsapp/status`,
        ).pipe(map((response) => response.data));
    }

    logoutWhatsApp(): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(
            `${environment.api}/whatsapp/logout`,
            {},
        );
    }
}
