import { Pipe, PipeTransform } from "@angular/core";
import { BulkStatus } from "../../interface/bulk-status.interface";

const BULK_STATUS_LABELS: Record<BulkStatus, string> = {
  [BulkStatus.PENDING]: "Pendiente",
  [BulkStatus.PROCESSING]: "Procesando",
  [BulkStatus.COMPLETED]: "Completado",
  [BulkStatus.FAILED]: "Fallido",
};

@Pipe({
  name: "bulkStatusLabel",
  standalone: true,
})
export class BulkStatusLabelPipe implements PipeTransform {
  transform(status: BulkStatus | string | null | undefined): string {
    if (!status) return "";

    const normalizedStatus = status.toString().toLowerCase() as BulkStatus;
    return BULK_STATUS_LABELS[normalizedStatus] ?? status.toString();
  }
}
