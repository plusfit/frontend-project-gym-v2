import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { Subject, takeUntil } from "rxjs";
import {
  WhatsAppConnectionStatus,
  WhatsAppStatusResponse,
} from "../../interface/whatsapp-status.interface";
import { NotificationService } from "../../services/notification.service";
import { BulkUploadComponent } from "../bulk-upload/bulk-upload.component";
import { WhatsAppConnectionComponent } from "../whatsapp-connection/whatsapp-connection.component";

export interface WhatsappBulkDialogState {
  status: WhatsAppConnectionStatus;
  isConnected: boolean;
  loading: boolean;
  disconnecting?: boolean;
  error?: string;
}

@Component({
  selector: "app-notifications-whatsapp-bulk-dialog",
  standalone: true,
  imports: [MatDialogModule, WhatsAppConnectionComponent, BulkUploadComponent],
  templateUrl: "./notifications-whatsapp-bulk-dialog.component.html",
  styleUrls: ["./notifications-whatsapp-bulk-dialog.component.css"],
})
export class NotificationsWhatsappBulkDialogComponent implements OnInit, OnDestroy {
  readonly WhatsAppConnectionStatus = WhatsAppConnectionStatus;
  showCsvInfo = true;

  state: WhatsappBulkDialogState = {
    status: WhatsAppConnectionStatus.INITIALIZING,
    isConnected: false,
    loading: true,
  };

  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private dialogRef: MatDialogRef<NotificationsWhatsappBulkDialogComponent>,
  ) {}

  ngOnInit(): void {
    this.loadWhatsAppStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  close(): void {
    this.dialogRef.close();
  }

  dismissCsvInfo(): void {
    this.showCsvInfo = false;
  }

  downloadCsvTemplate(): void {
    const csvTemplate = "to,message\n+59899123456,Hola este es un mensaje de prueba\n";
    const blob = new Blob([csvTemplate], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "plantilla-notificaciones-whatsapp.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  onStatusChange(status: WhatsAppStatusResponse): void {
    this.applyStatus(status);
  }

  disconnectWhatsApp(): void {
    if (this.state.disconnecting) return;

    this.state = {
      ...this.state,
      disconnecting: true,
      error: undefined,
    };

    this.notificationService
      .logoutWhatsApp()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.state = {
            status: WhatsAppConnectionStatus.DISCONNECTED,
            isConnected: false,
            loading: false,
            disconnecting: false,
          };
        },
        error: () => {
          this.state = {
            ...this.state,
            disconnecting: false,
            error: "No pudimos desconectar WhatsApp. Intentá nuevamente.",
          };
        },
      });
  }

  get statusText(): string {
    switch (this.state.status) {
      case WhatsAppConnectionStatus.CONNECTED:
        return "WhatsApp conectado";
      case WhatsAppConnectionStatus.CONNECTING:
        return "Conectando WhatsApp";
      case WhatsAppConnectionStatus.QR_READY:
        return "QR listo para escanear";
      case WhatsAppConnectionStatus.INITIALIZING:
        return "Verificando conexión";
      case WhatsAppConnectionStatus.ERROR:
        return "Requiere atención";
      default:
        return "WhatsApp desconectado";
    }
  }

  get statusDescription(): string {
    if (this.state.loading) {
      return "Estamos leyendo el estado actual antes de habilitar el flujo correcto.";
    }

    if (this.state.isConnected) {
      return "Listo para enviar mensajes desde un archivo CSV validado.";
    }

    if (this.state.error) {
      return this.state.error;
    }

    return "Conectá WhatsApp para enviar CSV sin exponer el formulario antes de tiempo.";
  }

  get statusClass(): string {
    if (this.state.isConnected) return "connected";
    if (this.state.status === WhatsAppConnectionStatus.ERROR) return "error";
    return "pending";
  }

  private loadWhatsAppStatus(): void {
    this.notificationService
      .getWhatsAppStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (status) => this.applyStatus(status),
        error: () => {
          this.state = {
            status: WhatsAppConnectionStatus.ERROR,
            isConnected: false,
            loading: false,
            error:
              "No pudimos leer el estado de WhatsApp. Revisá la conexión o intentá nuevamente.",
          };
        },
      });
  }

  private applyStatus(status: WhatsAppStatusResponse): void {
    this.state = {
      status: status.status || WhatsAppConnectionStatus.DISCONNECTED,
      isConnected: status.isConnected || status.status === WhatsAppConnectionStatus.CONNECTED,
      loading: false,
      disconnecting: false,
      error: status.error,
    };
  }
}
