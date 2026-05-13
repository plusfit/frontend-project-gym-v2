import { of } from "rxjs";
import { ClearBulkStatus } from "../../actions/bulk-notifications.actions";
import { BulkStatus } from "../../interface/bulk-status.interface";
import { BulkUploadComponent } from "./bulk-upload.component";

describe("BulkUploadComponent", () => {
  function createComponent() {
    const store = jasmine.createSpyObj("Store", ["select", "dispatch"]);
    store.select.and.returnValue(of(null));
    return {
      component: new BulkUploadComponent(store),
      store,
    };
  }

  it("does not clear NGXS bulk status when the modal destroys the upload component", () => {
    const { component, store } = createComponent();

    component.ngOnDestroy();

    const dispatchedActions: unknown[] = store.dispatch.calls.allArgs().flat();
    expect(dispatchedActions.some((action) => action instanceof ClearBulkStatus)).toBeFalse();
  });

  it("keeps explicit clear as the only status reset action", () => {
    const { component, store } = createComponent();

    component.clear();

    const dispatchedActions: unknown[] = store.dispatch.calls.allArgs().flat();
    expect(dispatchedActions.some((action) => action instanceof ClearBulkStatus)).toBeTrue();
  });

  it("announces deterministic progress percentages for in-flight upload state", () => {
    const { component } = createComponent();

    expect(
      component.getProgressPercentage({
        batchId: "batch-1",
        status: BulkStatus.PROCESSING,
        totalRows: 8,
        processedRows: 3,
        successCount: 2,
        failureCount: 1,
      }),
    ).toBe(38);

    expect(
      component.getProgressPercentage({
        batchId: "batch-2",
        status: BulkStatus.PENDING,
        totalRows: 0,
        processedRows: 0,
        successCount: 0,
        failureCount: 0,
      }),
    ).toBe(0);
  });

  it("treats pending and processing CSV batches as indeterminate loading states", () => {
    const { component } = createComponent();

    expect(
      component.isProcessingStatus({
        batchId: "batch-pending",
        status: BulkStatus.PENDING,
        totalRows: 0,
        processedRows: 0,
        successCount: 0,
        failureCount: 0,
      }),
    ).toBeTrue();

    expect(
      component.isProcessingStatus({
        batchId: "batch-processing",
        status: BulkStatus.PROCESSING,
        totalRows: 10,
        processedRows: 4,
        successCount: 4,
        failureCount: 0,
      }),
    ).toBeTrue();

    expect(
      component.isProcessingStatus({
        batchId: "batch-complete",
        status: BulkStatus.COMPLETED,
        totalRows: 10,
        processedRows: 10,
        successCount: 10,
        failureCount: 0,
      }),
    ).toBeFalse();
  });
});
