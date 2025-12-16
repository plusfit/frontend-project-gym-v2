import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";

@Injectable({
    providedIn: "root",
})
export class NotificationService {
    constructor(private http: HttpClient) { }

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
        status?: string,
        reason?: string,
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

    updateNotificationStatus(id: string, status: string): Observable<any> {
        return this.http.patch<any>(`${environment.api}/notifications/${id}/status`, {
            status,
        });
    }

    deleteNotification(id: string): Observable<any> {
        return this.http.delete<any>(`${environment.api}/notifications/${id}`);
    }
}
