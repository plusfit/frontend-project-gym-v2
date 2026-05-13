import { BulkStatus } from "../../interface/bulk-status.interface";
import { BulkStatusLabelPipe } from "./bulk-status-label.pipe";

describe("BulkStatusLabelPipe", () => {
  const pipe = new BulkStatusLabelPipe();

  it("translates known bulk upload statuses to Spanish labels", () => {
    expect(pipe.transform(BulkStatus.PENDING)).toBe("Pendiente");
    expect(pipe.transform(BulkStatus.PROCESSING)).toBe("Procesando");
    expect(pipe.transform(BulkStatus.COMPLETED)).toBe("Completado");
    expect(pipe.transform(BulkStatus.FAILED)).toBe("Fallido");
  });

  it("normalizes backend status casing before translating", () => {
    expect(pipe.transform("PENDING")).toBe("Pendiente");
    expect(pipe.transform("Pending")).toBe("Pendiente");
    expect(pipe.transform("processing")).toBe("Procesando");
  });

  it("keeps unknown statuses readable instead of hiding backend data", () => {
    expect(pipe.transform("queued")).toBe("queued");
    expect(pipe.transform(null)).toBe("");
  });
});
