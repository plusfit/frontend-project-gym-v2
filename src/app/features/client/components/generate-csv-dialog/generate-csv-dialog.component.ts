import { ChangeDetectionStrategy, Component, Inject, inject, output } from "@angular/core";
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
  message: string = "";
  loading: boolean = false;

  confirm = output<{ message: string } | null>();

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      filters: any;
      total: number;
    },
    private clientService: ClientService,
    private dialogRef: MatDialogRef<GenerateCsvDialogComponent>
  ) {}

  formatPhone(phone: string): string {
    if (!phone) return "";
    const cleanPhone = String(phone).trim();

    if (cleanPhone.startsWith("+598")) {
      return cleanPhone;
    }

    if (cleanPhone.startsWith("09")) {
      return `+598${cleanPhone.substring(1)}`;
    }

    return `+598${cleanPhone}`;
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

  private downloadCsv(content: string): void {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `clientes_${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
