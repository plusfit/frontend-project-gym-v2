/**
 * Splits CSV text into records, honouring RFC 4180 quoting.
 *
 * A newline only ends a record when it is outside a quoted field. That is what
 * makes multiline WhatsApp messages survive: the whole message lives in one
 * quoted field, so splitting on every "\n" would tear a single recipient into
 * fragments and produce a file the notifications service cannot parse.
 *
 * @param content Raw CSV text
 * @returns One string per record, blank records removed
 */
export function splitCsvRecords(content: string): string[] {
  if (!content) return [];

  const records: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < content.length; index++) {
    const char = content[index];

    if (char === '"') {
      // A doubled quote is an escaped quote, so it stays part of the value and
      // must not flip the quoting state.
      if (insideQuotes && content[index + 1] === '"') {
        current += '""';
        index++;
        continue;
      }

      insideQuotes = !insideQuotes;
      current += char;
      continue;
    }

    if (!insideQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && content[index + 1] === "\n") index++;
      records.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  records.push(current);

  return records.filter((record) => record.trim() !== "");
}
