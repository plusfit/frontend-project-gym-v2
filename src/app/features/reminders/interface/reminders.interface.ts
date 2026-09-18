/** A tunable the admin can set for a rule, described by the backend. */
export interface ReminderRuleParam {
	name: string;
	label: string;
	type: "number";
	min: number;
	max: number;
}

/** One reminder rule as the backend catalog describes it. */
export interface ReminderRuleCatalogEntry {
	key: string;
	label: string;
	description: string;
	params: ReminderRuleParam[];
	defaultSettings: ReminderRuleSettings;
}

export interface ReminderRuleSettings {
	enabled: boolean;
	sendHour: number;
	[param: string]: boolean | number;
}

export interface ReminderCatalogResponse {
	rules: ReminderRuleCatalogEntry[];
}

export interface ReminderSettingsResponse {
	settings: Record<string, ReminderRuleSettings>;
}
