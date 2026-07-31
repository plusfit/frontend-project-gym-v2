import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { BtnDirective } from "@shared/directives/btn/btn.directive";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { ClientService } from "../../services/client.service";

export interface CsvPart {
  filename: string;
  content: string;
}

@Component({
  selector: "app-generate-csv-dialog",
  templateUrl: "./generate-csv-dialog.component.html",
  styleUrl: "./generate-csv-dialog.component.css",
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    BtnDirective,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateCsvDialogComponent {
  /**
   * Workaround for a bulk-upload timeout, not a WhatsApp limit.
   *
   * The gym backend proxies the upload to the notifications service with a 30s
   * axios timeout, and that service enqueues rows one at a time, so the request
   * grows with the recipient count. Around 50 recipients it still fits; 200 does
   * not. Capping each file at 45 keeps every upload inside the timeout.
   *
   * Remove this once the notifications service enqueues in bulk and answers 202
   * immediately, which the dashboard already polls for.
   */
  static readonly MAX_RECIPIENTS_PER_FILE = 45;
  // Delay between downloads so the browser does not block consecutive file saves
  private static readonly DOWNLOAD_STAGGER_MS = 300;
  private static readonly REVOKE_DELAY_MS = 1000;

  message: string = "";
  loading: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      filters: any;
      total: number;
    },
    private clientService: ClientService,
    private dialogRef: MatDialogRef<GenerateCsvDialogComponent>,
  ) {}

  get estimatedFiles(): number {
    return Math.max(
      1,
      Math.ceil(this.data.total / GenerateCsvDialogComponent.MAX_RECIPIENTS_PER_FILE),
    );
  }

  get maxRecipientsPerFile(): number {
    return GenerateCsvDialogComponent.MAX_RECIPIENTS_PER_FILE;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onGenerate(): void {
    if (!this.message.trim()) return;

    this.loading = true;
    const { filters } = this.data;

    this.clientService
      .exportClientsCsv(filters, this.message)
      .subscribe({
        next: (csvContent) => {
          this.downloadCsv(csvContent);
          this.loading = false;
          this.dialogRef.close();
        },
        error: (err) => {
          console.error("Error exporting clients CSV:", err);
          this.loading = false;
        },
      });
  }

  buildCsvParts(content: string): CsvPart[] {
    const lines = content.split("\n").filter((line) => line.trim() !== "");
    const [header, ...rows] = lines;
    const baseFilename = this.buildBaseFilename();
    const maxPerFile = GenerateCsvDialogComponent.MAX_RECIPIENTS_PER_FILE;

    if (rows.length <= maxPerFile) {
      return [{ filename: `${baseFilename}.csv`, content: [header, ...rows].join("\n") }];
    }

    const totalParts = Math.ceil(rows.length / maxPerFile);
    const parts: CsvPart[] = [];

    for (let part = 0; part < totalParts; part++) {
      const chunk = rows.slice(part * maxPerFile, (part + 1) * maxPerFile);
      parts.push({
        filename: `${baseFilename}_parte${part + 1}de${totalParts}.csv`,
        content: [header, ...chunk].join("\n"),
      });
    }

    return parts;
  }

  private downloadCsv(content: string): void {
    this.buildCsvParts(content).forEach((part, index) => {
      setTimeout(
        () => this.triggerDownload(part.content, part.filename),
        index * GenerateCsvDialogComponent.DOWNLOAD_STAGGER_MS,
      );
    });
  }

  private buildBaseFilename(): string {
    const { filters } = this.data;
    const activeFilters: string[] = [];

    if (filters) {
      if (filters.searchQ && filters.searchQ.trim()) {
        const cleanSearch = filters.searchQ.trim().replace(/[^a-zA-Z0-9]/g, "_");
        activeFilters.push(`busqueda_${cleanSearch}`);
      }
      if (filters.withoutPlan) {
        activeFilters.push("sinPlan");
      }
      if (filters.disabled) {
        activeFilters.push("deshabilitados");
      }
      if (filters.overdue) {
        activeFilters.push("atrasados");
      }
    }

    const filtroAplicado = activeFilters.length > 0 ? activeFilters.join("_") : "todos";

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const fechaHora = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

    return `clientes_${filtroAplicado}_${fechaHora}`;
  }

  private triggerDownload(content: string, filename: string): void {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Revoking synchronously can abort the download in Firefox and Safari
    setTimeout(() => URL.revokeObjectURL(url), GenerateCsvDialogComponent.REVOKE_DELAY_MS);
  }
}
