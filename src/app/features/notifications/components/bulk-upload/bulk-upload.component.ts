import { AsyncPipe } from "@angular/common";
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Store } from "@ngxs/store";
import { Observable, Subject } from "rxjs";
import { ClearBulkStatus, UploadBulkCSV } from "../../actions/bulk-notifications.actions";
import { BulkStatus, BulkStatusResponse } from "../../interface/bulk-status.interface";
import { BulkNotificationsState } from "../../state/bulk-notifications.state";
import { BulkStatusLabelPipe } from "./bulk-status-label.pipe";

@Component({
  selector: "app-bulk-upload",
  standalone: true,
  imports: [AsyncPipe, BulkStatusLabelPipe],
  templateUrl: "./bulk-upload.component.html",
  styleUrls: ["./bulk-upload.component.css"],
})
export class BulkUploadComponent implements OnInit, OnDestroy {
  bulkStatus$: Observable<BulkStatusResponse | null>;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;

  @ViewChild("fileInput") fileInput?: ElementRef<HTMLInputElement>;

  selectedFile: File | null = null;
  rowCount = 0;
  isDragging = false;
  private destroy$ = new Subject<void>();

  constructor(private store: Store) {
    this.bulkStatus$ = this.store.select(BulkNotificationsState.getBulkStatus);
    this.isLoading$ = this.store.select(BulkNotificationsState.isBulkLoading);
    this.error$ = this.store.select(BulkNotificationsState.getBulkError);
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      return;
    }

    this.selectedFile = file;
    this.parseRowCount(file);
  }

  private parseRowCount(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split("\n").filter((line) => line.trim() !== "");
      this.rowCount = Math.max(0, lines.length - 1);
    };
    reader.readAsText(file);
  }

  upload(): void {
    if (!this.selectedFile) return;
    this.store.dispatch(new UploadBulkCSV(this.selectedFile));
  }

  clear(): void {
    this.selectedFile = null;
    this.rowCount = 0;
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = "";
    }
    this.store.dispatch(new ClearBulkStatus());
  }

  getProgressPercentage(status: BulkStatusResponse): number {
    if (status.totalRows === 0) return 0;
    return Math.round((status.processedRows / status.totalRows) * 100);
  }

  isCompleted(status: BulkStatusResponse): boolean {
    return status.status === BulkStatus.COMPLETED || status.status === BulkStatus.FAILED;
  }

  isProcessingStatus(status: BulkStatusResponse): boolean {
    return status.status === BulkStatus.PENDING || status.status === BulkStatus.PROCESSING;
  }
}
