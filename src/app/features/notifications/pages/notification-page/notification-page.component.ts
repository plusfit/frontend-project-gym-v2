import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { Router } from "@angular/router";
import {
  DeleteNotification,
  GetNotifications,
  UpdateNotificationStatus,
} from "@features/notifications/state/notifications.actions";
import { Actions, Store, ofActionSuccessful } from "@ngxs/store";
import {
  ConfirmDialogComponent,
  DialogType,
} from "@shared/components/confirm-dialog/confirm-dialog.component";
import { environment } from "../../../../../environments/environment";
import { FiltersBarComponent } from "../../../../shared/components/filter-bar/filter-bar.component";
import { Observable, Subject, takeUntil } from "rxjs";
import { NotificationData } from "@features/notifications/interface/notifications.interface";
import { AsyncPipe } from "@angular/common";
import { NotificationsState } from "@features/notifications/state/notifications.state";
import { MatDialog } from "@angular/material/dialog";
import { SnackBarService } from "@core/services/snackbar.service";
import { FilterSelectComponent } from "../../../../shared/components/filter-select/filter-select.component";
import { TableComponent } from "../../../../shared/components/table/table.component";

@Component({
  selector: "app-notification-page",
  standalone: true,
  imports: [FiltersBarComponent, TableComponent, MatPaginator, AsyncPipe, FilterSelectComponent],
  templateUrl: "./notification-page.component.html",
  styleUrl: "./notification-page.component.css",
})
export class NotificationPageComponent implements OnInit, OnDestroy {
  notifications!: Observable<NotificationData[] | null>;
  loading!: Observable<boolean | null>;
  total!: Observable<number | null>;
  filterControl = new FormControl("all");

  pageSize = environment.config.pageSize;
  filterValues: any | null = null;
  displayedColumns: string[] = [
    "name",
    "reason",
    "phone",
    "status",
    "createdAt",
    "acciones",
  ];

  private destroy = new Subject<void>();

  constructor(
    private store: Store,
    private actions: Actions,
    private router: Router,
    private dialog: MatDialog,
    private snackbar: SnackBarService,
  ) {}

  ngOnInit(): void {
    this.notifications = this.store.select(NotificationsState.getNotifications);
    this.loading = this.store.select(NotificationsState.isLoading);
    this.total = this.store.select(NotificationsState.getTotal);
    this.filterValues = {
      page: 1,
      pageSize: this.pageSize,
      searchQ: "",
      status: "",
    };
    this.store.dispatch(new GetNotifications(this.filterValues));

    // Escuchar cambios en el control de filtro
    this.filterControl.valueChanges.pipe(takeUntil(this.destroy)).subscribe((value) => {
      if (value !== null) {
        this.applyFilterFromControl(value);
      }
    });
  }

  paginate(pageEvent: PageEvent): void {
    const currentPage = pageEvent.pageIndex + 1;
    const currentPageSize = pageEvent.pageSize;

    this.filterValues = {
      ...this.filterValues,
      page: currentPage,
      pageSize: currentPageSize,
    };

    this.store.dispatch(new GetNotifications(this.filterValues));
  }

  onSearch(searchQuery: { searchQ: string }): void {
    this.filterValues = {
      ...this.filterValues,
      page: 1,
      searchQ: searchQuery.searchQ,
    };

    this.store.dispatch(new GetNotifications(this.filterValues));
  }

  private applyFilterFromControl(selectedValue: string): void {
    let status = "";

    if (selectedValue === "PENDING") {
      status = "PENDING";
    } else if (selectedValue === "COMPLETED") {
      status = "COMPLETED";
    }

    this.filterValues = {
      ...this.filterValues,
      page: 1,
      status,
    };

    this.store.dispatch(new GetNotifications(this.filterValues));
  }

  updateStatus(notification: NotificationData, newStatus: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "500px",
      data: {
        title: "Actualizar estado",
        contentMessage: `¿Estás seguro que deseas marcar esta notificación como ${newStatus === "COMPLETED" ? "completada" : "pendiente"}?`,
        type: DialogType.GENERAL,
      },
    });

    dialogRef.componentInstance.confirm.subscribe((confirmed) => {
      if (!confirmed) return;

      this.store.dispatch(new UpdateNotificationStatus(notification._id, newStatus));
      this.actions
        .pipe(ofActionSuccessful(UpdateNotificationStatus), takeUntil(this.destroy))
        .subscribe(() => {
          this.store.dispatch(new GetNotifications(this.filterValues));
        });
    });
  }

  deleteNotification(event: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "500px",
      data: {
        title: "Eliminar notificación",
        contentMessage:
          "¿Estás seguro que deseas eliminar esta notificación? Esta acción no se puede deshacer.",
        type: DialogType.GENERAL,
      },
    });

    dialogRef.componentInstance.confirm.subscribe((confirmed) => {
      if (!confirmed) return;

      const id = event?._id || event?.id || event;
      this.store.dispatch(new DeleteNotification(id));
      this.actions
        .pipe(ofActionSuccessful(DeleteNotification), takeUntil(this.destroy))
        .subscribe(() => {
          this.snackbar.showSuccess("Éxito", "Notificación eliminada");
        });
    });
  }

  getStatusBadge(status: string): { text: string; class: string } {
    if (status === "COMPLETED") {
      return {
        text: "Completada",
        class: "text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs font-medium",
      };
    }

    return {
      text: "Pendiente",
      class: "text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium",
    };
  }

  getReasonBadge(reason: string): { text: string; class: string } {
    if (reason === "Primera vez") {
      return {
        text: "Primera vez",
        class: "text-blue-700 bg-blue-100 px-3 py-1 rounded-full text-xs font-semibold",
      };
    } else if (reason === "Inactividad") {
      return {
        text: "Inactividad",
        class: "text-orange-700 bg-orange-100 px-3 py-1 rounded-full text-xs font-semibold",
      };
    }

    return {
      text: reason,
      class: "text-gray-700 bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold",
    };
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
