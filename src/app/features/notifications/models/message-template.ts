/**
 * The one personalization token the campaign composer understands. Mirrors the
 * gym backend's whatsapp-message.utils, which performs the real interpolation
 * at send time — keep both in sync or the preview lies.
 */
export const NAME_TOKEN = "{nombre}";

/**
 * Replaces every token with the recipient's display name.
 *
 * split/join instead of String.replace on purpose: a name containing "$&"
 * would trigger replace()'s dollar-pattern expansion and corrupt the message.
 */
export const interpolateName = (template: string, name: string): string =>
    template.split(NAME_TOKEN).join(name);

/** Inserts a token at the cursor, replacing any selected range. */
export const insertToken = (
    text: string,
    token: string,
    start: number,
    end: number,
): { text: string; cursor: number } => ({
    text: text.slice(0, start) + token + text.slice(end),
    cursor: start + token.length,
});
