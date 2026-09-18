import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { environment } from "../../../../environments/environment";
import {
	ReminderCatalogResponse,
	ReminderRuleSettings,
	ReminderSettingsResponse,
} from "../interface/reminders.interface";

/**
 * Reads and writes the automated reminder configuration.
 *
 * The rule list comes from the backend catalog rather than this bundle, so a
 * reminder added on the server shows up here without a dashboard release.
 */
@Injectable({ providedIn: "root" })
export class RemindersService {
	constructor(private http: HttpClient) {}

	getCatalog(): Observable<ReminderCatalogResponse> {
		return this.http.get<ReminderCatalogResponse>(`${environment.api}/reminders/catalog`);
	}

	getSettings(): Observable<ReminderSettingsResponse> {
		return this.http.get<ReminderSettingsResponse>(`${environment.api}/reminders/settings`);
	}

	/** Partial update: only the rules and fields sent are changed. */
	updateSettings(
		settings: Record<string, Partial<ReminderRuleSettings>>,
	): Observable<ReminderSettingsResponse> {
		return this.http.patch<ReminderSettingsResponse>(
			`${environment.api}/reminders/settings`,
			{ settings },
		);
	}
}
