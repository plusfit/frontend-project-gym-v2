import { Injectable } from "@angular/core";
import { SnackBarService } from "@core/services/snackbar.service";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { interval, Subscription } from "rxjs";
import { catchError, tap, switchMap, takeWhile } from "rxjs/operators";
import { NotificationService } from "../services/notification.service";
import {
    UploadBulkCSV,
    PollBulkStatus,
    ClearBulkStatus,
    SetBulkStatus,
    SetBulkError,
} from "../actions/bulk-notifications.actions";
import { BulkStatus, BulkStatusResponse } from "../interface/bulk-status.interface";

interface BulkNotificationsStateModel {
    bulkStatus: BulkStatusResponse | null;
    bulkLoading: boolean;
    bulkError: string | null;
}

@State<BulkNotificationsStateModel>({
    name: "bulkNotifications",
    defaults: {
        bulkStatus: null,
        bulkLoading: false,
        bulkError: null,
    },
})
@Injectable({
    providedIn: "root",
})
export class BulkNotificationsState {
    private pollingSubscription: Subscription | null = null;

    @Selector()
    static getBulkStatus(state: BulkNotificationsStateModel): BulkStatusResponse | null {
        return state.bulkStatus;
    }

    @Selector()
    static isBulkLoading(state: BulkNotificationsStateModel): boolean {
        return state.bulkLoading;
    }

    @Selector()
    static getBulkError(state: BulkNotificationsStateModel): string | null {
        return state.bulkError;
    }

    constructor(
        private notificationService: NotificationService,
        private snackbar: SnackBarService,
    ) {}

    @Action(UploadBulkCSV)
    uploadBulkCSV(ctx: StateContext<BulkNotificationsStateModel>, action: UploadBulkCSV) {
        ctx.patchState({ bulkLoading: true, bulkError: null });

        return this.notificationService.uploadBulkCSV(action.file).pipe(
            tap((response) => {
                ctx.patchState({
                    bulkStatus: {
                        batchId: response.batchId,
                        status: BulkStatus.PENDING,
                        totalRows: response.total,
                        processedRows: 0,
                        successCount: 0,
                        failureCount: 0,
                    },
                    bulkLoading: false,
                });
                ctx.dispatch(new PollBulkStatus(response.batchId));
            }),
            catchError((error) => {
                ctx.patchState({
                    bulkLoading: false,
                    bulkError: error.error?.message || "Error al subir el archivo CSV",
                });
                this.snackbar.showError("Error", error.error?.message || "Error al subir el archivo CSV");
                throw error;
            }),
        );
    }

    @Action(PollBulkStatus)
    pollBulkStatus(ctx: StateContext<BulkNotificationsStateModel>, action: PollBulkStatus) {
        this.stopPolling();

        this.pollingSubscription = interval(5000)
            .pipe(
                switchMap(() => this.notificationService.getBulkStatus(action.batchId)),
                takeWhile((status) => {
                    return status.status === BulkStatus.PENDING || status.status === BulkStatus.PROCESSING;
                }, true),
            )
            .subscribe({
                next: (status) => {
                    ctx.dispatch(new SetBulkStatus(status));
                    if (status.status === BulkStatus.COMPLETED || status.status === BulkStatus.FAILED) {
                        this.stopPolling();
                        if (status.status === BulkStatus.COMPLETED) {
                            this.snackbar.showSuccess(
                                "Completado",
                                `Envío masivo finalizado: ${status.successCount} enviados, ${status.failureCount} fallidos`,
                            );
                        } else {
                            this.snackbar.showError(
                                "Error",
                                `Envío masivo fallido: ${status.failureCount} mensajes no enviados`,
                            );
                        }
                    }
                },
                error: (error) => {
                    ctx.dispatch(new SetBulkError(error.error?.message || "Error al consultar estado"));
                    this.stopPolling();
                },
            });
    }

    @Action(SetBulkStatus)
    setBulkStatus(ctx: StateContext<BulkNotificationsStateModel>, action: SetBulkStatus) {
        ctx.patchState({ bulkStatus: action.status });
    }

    @Action(SetBulkError)
    setBulkError(ctx: StateContext<BulkNotificationsStateModel>, action: SetBulkError) {
        ctx.patchState({ bulkError: action.error, bulkLoading: false });
    }

    @Action(ClearBulkStatus)
    clearBulkStatus(ctx: StateContext<BulkNotificationsStateModel>) {
        this.stopPolling();
        ctx.patchState({
            bulkStatus: null,
            bulkError: null,
            bulkLoading: false,
        });
    }

    private stopPolling() {
        if (this.pollingSubscription) {
            this.pollingSubscription.unsubscribe();
            this.pollingSubscription = null;
        }
    }
}