import { Pipe, PipeTransform } from "@angular/core";

/** &, <, >, " and ' — everything that could turn user text into live HTML. */
const HTML_ESCAPES: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
};

const escapeHtml = (value: string): string =>
    value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

/**
 * WhatsApp only formats a marker pair whose content neither starts nor ends
 * with whitespace, so "5 * 3 = 15" stays arithmetic. One regex per marker,
 * applied per line so a pair never spans a line break — WhatsApp does not
 * format across lines either.
 */
const BOLD = /\*(\S(?:[^*\n]*\S)?)\*/g;
const ITALIC = /_(\S(?:[^_\n]*\S)?)_/g;
const STRIKE = /~(\S(?:[^~\n]*\S)?)~/g;

/** A list marker only counts at the very start of the line, like on the phone. */
const LIST_MARKER = /^- /;

/**
 * Renders WhatsApp markup the way the recipient's phone will. The input is
 * escaped first: the preview binds through innerHTML, and a campaign that
 * mentions "<promo>" must never become an element.
 */
@Pipe({ name: "whatsappFormat", standalone: true })
export class WhatsAppFormatPipe implements PipeTransform {
    transform(value: string): string {
        if (!value) return "";

        return escapeHtml(value)
            .split("\n")
            .map((line) =>
                line
                    .replace(LIST_MARKER, "• ")
                    .replace(BOLD, "<strong>$1</strong>")
                    .replace(ITALIC, "<em>$1</em>")
                    .replace(STRIKE, "<s>$1</s>"),
            )
            .join("<br>");
    }
}
