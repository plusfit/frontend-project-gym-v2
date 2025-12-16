import { Injectable } from "@angular/core";
import { SnackBarService } from "@core/services/snackbar.service";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { catchError, map, tap, throwError } from "rxjs";
import { NotificationData } from "../interface/notifications.interface";
import { NotificationService } from "../services/notification.service";
import {
    GetNotifications,
    GetNotificationById,
    UpdateNotificationStatus,
    DeleteNotification,
} from "./notifications.actions";
import { NotificationsStateModel } from "./notifications.model";

@State<NotificationsStateModel>({
    name: "notifications",
    defaults: {
        notifications: [],
        selectedNotification: undefined,
        total: 0,
        loading: false,
        error: null,
        currentPage: 0,
        pageSize: 0,
        pageCount: 0,
    },
})
@Injectable({
    providedIn: "root",
})
export class NotificationsState {
    @Selector()
    static getNotifications(state: NotificationsStateModel): NotificationData[] {
        return state.notifications ?? [];
    }

    @Selector()
    static getTotal(state: NotificationsStateModel) {
        return state.total ?? 0;
    }

    @Selector()
    static isLoading(state: NotificationsStateModel) {
        return state.loading ?? false;
    }

    @Selector()
    static getSelectedNotification(state: NotificationsStateModel) {
        return state.selectedNotification ?? {};
    }

    constructor(
        private notificationService: NotificationService,
        private snackbar: SnackBarService,
    ) { }

    @Action(GetNotifications)
    getNotifications(
        ctx: StateContext<NotificationsStateModel>,
        action: GetNotifications,
    ) {
        ctx.patchState({ loading: true });
        const { page, pageSize, searchQ, status } = action.payload;

        return this.notificationService
            .getNotificationsByFilters(page, pageSize, searchQ, status)
            .pipe(
                tap((response) => {
                    ctx.patchState({
                        notifications: response.data,
                        total: response.total,
                        currentPage: response.page,
                        pageSize: response.pageSize,
                        loading: false,
                    });
                }),
                catchError((error) => {
                    ctx.patchState({ loading: false, error });
                    this.snackbar.showError("Error", "Error al cargar notificaciones");
                    return throwError(() => error);
                }),
            );
    }

    @Action(GetNotificationById)
    getNotificationById(
        ctx: StateContext<NotificationsStateModel>,
        action: GetNotificationById,
    ) {
        ctx.patchState({ loading: true });

        return this.notificationService.getNotificationById(action.id).pipe(
            tap((response) => {
                ctx.patchState({
                    selectedNotification: response.data,
                    loading: false,
                });
            }),
            catchError((error) => {
                ctx.patchState({ loading: false, error });
                this.snackbar.showError("Error", "Error al cargar la notificación");
                return throwError(() => error);
            }),
        );
    }

    @Action(UpdateNotificationStatus)
    updateNotificationStatus(
        ctx: StateContext<NotificationsStateModel>,
        action: UpdateNotificationStatus,
    ) {
        ctx.patchState({ loading: true });

        return this.notificationService
            .updateNotificationStatus(action.id, action.status)
            .pipe(
                tap((response) => {
                    const state = ctx.getState();
                    const notifications = state.notifications?.map((notification) =>
                        notification._id === action.id
                            ? { ...notification, status: action.status }
                            : notification,
                    );

                    ctx.patchState({
                        notifications,
                        loading: false,
                    });

                    this.snackbar.showSuccess(
                        "Éxito",
                        "Estado de la notificación actualizado",
                    );
                }),
                catchError((error) => {
                    ctx.patchState({ loading: false, error });
                    this.snackbar.showError(
                        "Error",
                        "Error al actualizar el estado de la notificación",
                    );
                    return throwError(() => error);
                }),
            );
    }

    @Action(DeleteNotification)
    deleteNotification(
        ctx: StateContext<NotificationsStateModel>,
        action: DeleteNotification,
    ) {
        ctx.patchState({ loading: true });

        return this.notificationService.deleteNotification(action.id).pipe(
            tap((response) => {
                const state = ctx.getState();
                const notifications = state.notifications?.filter(
                    (notification) => notification._id !== action.id,
                );

                ctx.patchState({
                    notifications,
                    total: (state.total ?? 0) - 1,
                    loading: false,
                });

                this.snackbar.showSuccess("Éxito", "Notificación eliminada");
            }),
            catchError((error) => {
                ctx.patchState({ loading: false, error });
                this.snackbar.showError("Error", "Error al eliminar la notificación");
                return throwError(() => error);
            }),
        );
    }
}
