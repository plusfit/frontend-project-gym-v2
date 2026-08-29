import { splitCsvRecords } from "./csv.helper";

/**
 * The bulk export used to split its CSV with content.split("\n"), which treats
 * every newline as a record boundary. A WhatsApp message spanning several lines
 * lives inside one quoted field, so that split shattered a single recipient
 * into fragments and produced files the notifications service refused to parse.
 */
describe("splitCsvRecords", () => {
  it("splits plain single-line records", () => {
    expect(splitCsvRecords('to,message\n+59899000001,"hola"')).toEqual([
      "to,message",
      '+59899000001,"hola"',
    ]);
  });

  it("keeps a quoted multiline field inside one record", () => {
    const content = ['to,message', '+59899000001,"linea uno\nlinea dos\nlinea tres"'].join("\n");

    expect(splitCsvRecords(content)).toEqual([
      "to,message",
      '+59899000001,"linea uno\nlinea dos\nlinea tres"',
    ]);
  });

  it("counts one record per recipient when every message is multiline", () => {
    const message = '"hola\n\n- uno\n- dos"';
    const content = [
      "to,message",
      `+59899000001,${message}`,
      `+59899000002,${message}`,
      `+59899000003,${message}`,
    ].join("\n");

    expect(splitCsvRecords(content).length).toBe(4);
  });

  it("treats a doubled quote as escaped content, not a field boundary", () => {
    const content = 'to,message\n+59899000001,"di ""hola""\ny chau"';

    expect(splitCsvRecords(content)).toEqual([
      "to,message",
      '+59899000001,"di ""hola""\ny chau"',
    ]);
  });

  it("keeps commas and semicolons that live inside a quoted field", () => {
    const content = 'to,message\n+59899000001,"uno, dos; tres"';

    expect(splitCsvRecords(content).length).toBe(2);
    expect(splitCsvRecords(content)[1]).toBe('+59899000001,"uno, dos; tres"');
  });

  it("handles CRLF record separators", () => {
    expect(splitCsvRecords('to,message\r\n+59899000001,"hola"')).toEqual([
      "to,message",
      '+59899000001,"hola"',
    ]);
  });

  it("preserves CRLF that lives inside a quoted field", () => {
    const content = 'to,message\n+59899000001,"uno\r\ndos"';

    expect(splitCsvRecords(content)[1]).toBe('+59899000001,"uno\r\ndos"');
  });

  it("drops blank records so a trailing newline adds nothing", () => {
    expect(splitCsvRecords('to,message\n+59899000001,"hola"\n\n')).toEqual([
      "to,message",
      '+59899000001,"hola"',
    ]);
  });

  it("returns nothing for empty content", () => {
    expect(splitCsvRecords("")).toEqual([]);
    expect(splitCsvRecords("\n\n")).toEqual([]);
  });

  it("returns just the header when there are no recipients", () => {
    expect(splitCsvRecords("to,message")).toEqual(["to,message"]);
  });
});
