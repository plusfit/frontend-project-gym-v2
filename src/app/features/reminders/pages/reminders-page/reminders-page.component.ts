import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { SnackBarService } from "@core/services/snackbar.service";
import { firstValueFrom } from "rxjs";

import {
	ReminderRuleCatalogEntry,
	ReminderRuleSettings,
} from "../../interface/reminders.interface";
import { RemindersService } from "../../services/reminders.service";

/** A catalog entry paired with the values currently saved for it. */
interface RuleRow {
	rule: ReminderRuleCatalogEntry;
	settings: ReminderRuleSettings;
	saving: boolean;
}

/**
 * Lets the admin turn each automated reminder on or off and tune its
 * thresholds. This is the operational kill switch: a reminder that misfires can
 * be stopped from here without a deploy.
 */
@Component({
	selector: "app-reminders-page",
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		MatCardModule,
		MatSlideToggleModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatButtonModule,
		MatProgressSpinnerModule,
	],
	templateUrl: "./reminders-page.component.html",
})
export class RemindersPageComponent implements OnInit {
	private readonly remindersService = inject(RemindersService);
	private readonly snackBar = inject(SnackBarService);

	loading = true;
	rows: RuleRow[] = [];

	/** Every hour of the day, for the send-time selector. */
	readonly hours = Array.from({ length: 24 }, (_, hour) => hour);

	async ngOnInit(): Promise<void> {
		try {
			const [catalog, saved] = await Promise.all([
				firstValueFrom(this.remindersService.getCatalog()),
				firstValueFrom(this.remindersService.getSettings()),
			]);

			this.rows = catalog.rules.map((rule) => ({
				rule,
				// The backend already merged defaults, but a rule added between
				// the two calls would otherwise arrive without settings.
				settings: { ...rule.defaultSettings, ...(saved.settings[rule.key] ?? {}) },
				saving: false,
			}));
		} catch {
			this.snackBar.showError("Recordatorios", "No se pudo cargar la configuración");
		} finally {
			this.loading = false;
		}
	}

	formatHour(hour: number): string {
		return `${String(hour).padStart(2, "0")}:00`;
	}

	async save(row: RuleRow): Promise<void> {
		row.saving = true;

		try {
			const response = await firstValueFrom(
				this.remindersService.updateSettings({ [row.rule.key]: row.settings }),
			);

			row.settings = { ...row.settings, ...(response.settings[row.rule.key] ?? {}) };
			this.snackBar.showSuccess("Recordatorios", `"${row.rule.label}" actualizado`);
		} catch {
			this.snackBar.showError("Recordatorios", `No se pudo guardar "${row.rule.label}"`);
		} finally {
			row.saving = false;
		}
	}
}
