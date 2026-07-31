import { of, throwError } from "rxjs";
import { GenerateCsvDialogComponent } from "./generate-csv-dialog.component";

/**
 * These specs pin the cap with literal numbers on purpose. Uploads start timing
 * out somewhere above 50 recipients, so the 45 cap must not drift silently.
 * Deriving expectations from MAX_RECIPIENTS_PER_FILE would make them follow the
 * constant instead of guarding it.
 */
describe("GenerateCsvDialogComponent", () => {
  const OBSERVED_FAILURE_THRESHOLD = 50;
  const EXPECTED_CAP = 45;
  const HEADER = "to,message";

  function createComponent(total = 0, filters: Record<string, unknown> = {}) {
    const clientService = jasmine.createSpyObj("ClientService", ["exportClientsCsv"]);
    const dialogRef = jasmine.createSpyObj("MatDialogRef", ["close"]);

    return {
      component: new GenerateCsvDialogComponent({ filters, total }, clientService, dialogRef),
      clientService,
      dialogRef,
    };
  }

  function csvWithRecipients(count: number): string {
    const rows = Array.from({ length: count }, (_, i) => `+5989900000${i},"hola"`);
    return [HEADER, ...rows].join("\n");
  }

  function recipientsIn(content: string): string[] {
    return content.split("\n").slice(1);
  }

  it("caps recipients per file below the size where uploads start failing", () => {
    expect(GenerateCsvDialogComponent.MAX_RECIPIENTS_PER_FILE).toBe(EXPECTED_CAP);
    expect(GenerateCsvDialogComponent.MAX_RECIPIENTS_PER_FILE).toBeLessThan(
      OBSERVED_FAILURE_THRESHOLD,
    );
  });

  it("keeps a single file for exactly 45 recipients", () => {
    const { component } = createComponent();

    const parts = component.buildCsvParts(csvWithRecipients(45));

    expect(parts.length).toBe(1);
    expect(recipientsIn(parts[0].content).length).toBe(45);
    expect(parts[0].filename).not.toContain("parte");
  });

  it("splits into two numbered files at 46 recipients", () => {
    const { component } = createComponent();

    const parts = component.buildCsvParts(csvWithRecipients(46));

    expect(parts.length).toBe(2);
    expect(recipientsIn(parts[0].content).length).toBe(45);
    expect(recipientsIn(parts[1].content).length).toBe(1);
    expect(parts[0].filename).toContain("_parte1de2.csv");
    expect(parts[1].filename).toContain("_parte2de2.csv");
  });

  it("splits 200 recipients into five files of at most 45", () => {
    const { component } = createComponent();

    const parts = component.buildCsvParts(csvWithRecipients(200));

    expect(parts.length).toBe(5);
    expect(parts.map((part) => recipientsIn(part.content).length)).toEqual([45, 45, 45, 45, 20]);
  });

  it("never lets any file reach the size where uploads start failing", () => {
    const { component } = createComponent();

    for (const total of [46, 90, 91, 137, 500]) {
      for (const part of component.buildCsvParts(csvWithRecipients(total))) {
        expect(recipientsIn(part.content).length).toBeLessThan(OBSERVED_FAILURE_THRESHOLD);
      }
    }
  });

  it("repeats the header in every file so each one is independently importable", () => {
    const { component } = createComponent();

    const parts = component.buildCsvParts(csvWithRecipients(100));

    expect(parts.length).toBe(3);
    for (const part of parts) {
      expect(part.content.split("\n")[0]).toBe(HEADER);
    }
  });

  it("preserves every recipient exactly once across the split files", () => {
    const { component } = createComponent();
    const source = csvWithRecipients(97);

    const parts = component.buildCsvParts(source);
    const splitRecipients = parts.flatMap((part) => recipientsIn(part.content));

    expect(splitRecipients).toEqual(recipientsIn(source));
  });

  it("does not emit a trailing empty file on an exact multiple of the cap", () => {
    const { component } = createComponent();

    const parts = component.buildCsvParts(csvWithRecipients(90));

    expect(parts.length).toBe(2);
    expect(parts.map((part) => recipientsIn(part.content).length)).toEqual([45, 45]);
    expect(parts[1].filename).toContain("_parte2de2.csv");
  });

  it("produces one file when the export returns no recipients", () => {
    const { component } = createComponent();

    const parts = component.buildCsvParts(HEADER);

    expect(parts.length).toBe(1);
    expect(parts[0].content).toBe(HEADER);
  });

  it("keeps messages intact when the backend escaped quotes and commas", () => {
    const { component } = createComponent();
    const escaped = 'Hola, ""campeon"" - te esperamos';
    const source = [HEADER, `+59899000001,"${escaped}"`, `+59899000002,"${escaped}"`].join("\n");

    const [part] = component.buildCsvParts(source);

    expect(recipientsIn(part.content).length).toBe(2);
    expect(part.content).toContain(escaped);
  });

  it("estimates the file count shown to the user before generating", () => {
    expect(createComponent(45).component.estimatedFiles).toBe(1);
    expect(createComponent(46).component.estimatedFiles).toBe(2);
    expect(createComponent(200).component.estimatedFiles).toBe(5);
    expect(createComponent(0).component.estimatedFiles).toBe(1);
  });

  it("names files after the active filters so exports stay distinguishable", () => {
    const { component } = createComponent(10, { withoutPlan: true, overdue: true });

    const [part] = component.buildCsvParts(csvWithRecipients(3));

    expect(part.filename).toContain("sinPlan_atrasados");
  });

  /**
   * Browsers permit the first programmatic download of a batch and put the rest
   * behind a permission prompt, so files 2..N were silently dropped in
   * production. Multi-file exports must therefore never self-download: each
   * part waits for its own click, which always carries user activation.
   */
  describe("download", () => {
    let downloaded: string[];

    beforeEach(() => {
      downloaded = [];
      spyOn(HTMLAnchorElement.prototype, "click").and.callFake(function (this: HTMLAnchorElement) {
        downloaded.push(this.getAttribute("download") ?? "");
      });
    });

    function generate(recipients: number) {
      const { component, clientService, dialogRef } = createComponent(recipients);
      clientService.exportClientsCsv.and.returnValue(of(csvWithRecipients(recipients)));
      component.message = "hola";
      component.onGenerate();
      return { component, dialogRef };
    }

    it("never auto-downloads a multi-file export", () => {
      const { component, dialogRef } = generate(245);

      expect(component.parts.length).toBe(6);
      expect(downloaded).toEqual([]);
      expect(dialogRef.close).not.toHaveBeenCalled();
      expect(component.pendingCount).toBe(6);
    });

    it("downloads one file per click and tracks what is still missing", () => {
      const { component } = generate(100);

      component.downloadPart(component.parts[0]);
      expect(downloaded.length).toBe(1);
      expect(component.isDownloaded(component.parts[0])).toBeTrue();
      expect(component.pendingCount).toBe(2);

      component.downloadPart(component.parts[1]);
      component.downloadPart(component.parts[2]);

      expect(component.pendingCount).toBe(0);
      expect(downloaded).toEqual([
        jasmine.stringMatching(/_parte1de3\.csv$/),
        jasmine.stringMatching(/_parte2de3\.csv$/),
        jasmine.stringMatching(/_parte3de3\.csv$/),
      ]);
    });

    it("does not double-count a part downloaded twice", () => {
      const { component } = generate(100);

      component.downloadPart(component.parts[0]);
      component.downloadPart(component.parts[0]);

      expect(downloaded.length).toBe(2);
      expect(component.pendingCount).toBe(2);
    });

    it("auto-downloads and closes when the export fits in a single file", () => {
      const { component, dialogRef } = generate(45);

      expect(component.parts.length).toBe(1);
      expect(downloaded.length).toBe(1);
      expect(downloaded[0]).not.toContain("parte");
      expect(dialogRef.close).toHaveBeenCalled();
      expect(component.loading).toBeFalse();
    });

    it("surfaces a message and stays open when the export fails", () => {
      const { component, clientService, dialogRef } = createComponent(100);
      clientService.exportClientsCsv.and.returnValue(throwError(() => new Error("boom")));
      component.message = "hola";

      component.onGenerate();

      expect(component.exportError).toBeTruthy();
      expect(component.loading).toBeFalse();
      expect(component.parts).toEqual([]);
      expect(dialogRef.close).not.toHaveBeenCalled();
    });
  });
});
