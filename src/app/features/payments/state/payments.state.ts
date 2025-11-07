import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { Observable, catchError, tap, throwError } from "rxjs";

import { PaymentsStateModel } from "./payments.model";
import { PaymentsService } from "../services/payments.service";
import { SnackBarService } from "@core/services/snackbar.service";
import {
  GetPayments,
  SearchPaymentsByName,
  GetPaymentsSummary,
  UpdatePayment,
  DeletePayment,
  CreatePayment,
  ExportPayments,
  SetPaymentsFilters,
  ClearPaymentsError,
} from "./payments.actions";
import {
  PaymentItem,
  PaymentsSummary,
  PaymentsResponse,
  PaymentsFilters,
} from "../interfaces/payments.interface";

@State<PaymentsStateModel>({
  name: "payments",
  defaults: {
    loading: false,
    payments: [],
    selectedPayment: null,
    summary: null,
    summaryLoading: false,
    summaryError: false,
    total: 0,
    currentPage: 0,
    pageSize: 8,
    pageCount: 0,
    error: null,
    filters: null,
    hasError: false,
    errorMessage: "",
  },
})
@Injectable({
  providedIn: "root",
})
export class PaymentsState {
  @Selector()
  static getPayments(state: PaymentsStateModel): PaymentItem[] {
    return state.payments ?? [];
  }

  @Selector()
  static getTotal(state: PaymentsStateModel): number {
    return state.total ?? 0;
  }

  @Selector()
  static isLoading(state: PaymentsStateModel): boolean {
    return state.loading ?? false;
  }

  @Selector()
  static getCurrentPage(state: PaymentsStateModel): number {
    return state.currentPage ?? 0;
  }

  @Selector()
  static getPageSize(state: PaymentsStateModel): number {
    return state.pageSize ?? 8;
  }

  @Selector()
  static getSummary(state: PaymentsStateModel): PaymentsSummary | null {
    return state.summary ?? null;
  }

  @Selector()
  static isSummaryLoading(state: PaymentsStateModel): boolean {
    return state.summaryLoading ?? false;
  }

  @Selector()
  static hasSummaryError(state: PaymentsStateModel): boolean {
    return state.summaryError ?? false;
  }

  @Selector()
  static getError(state: PaymentsStateModel): any {
    return state.error;
  }

  @Selector()
  static hasError(state: PaymentsStateModel): boolean {
    return state.hasError ?? false;
  }

  @Selector()
  static getErrorMessage(state: PaymentsStateModel): string {
    return state.errorMessage ?? "";
  }

  @Selector()
  static getFilters(state: PaymentsStateModel): PaymentsFilters | null {
    return state.filters ?? null;
  }

  constructor(
    private paymentsService: PaymentsService,
    private snackBarService: SnackBarService
  ) { }

  @Action(GetPayments, { cancelUncompleted: true })
  getPayments(
    ctx: StateContext<PaymentsStateModel>,
    { filters }: GetPayments
  ): Observable<PaymentsResponse> {
    ctx.patchState({
      loading: true,
      hasError: false,
      errorMessage: "",
      filters: filters,
    });

    return this.paymentsService.getPayments(filters).pipe(
      tap((response: PaymentsResponse) => {
        ctx.patchState({
          payments: response.data.data,
          total: response.data.pagination.totalCount,
          currentPage: response.data.pagination.currentPage - 1, // Material paginator uses 0-based indexing
          pageSize: response.data.pagination.limit,
          pageCount: response.data.pagination.totalPages,
          loading: false,
        });
      }),
      catchError((error) => {
        ctx.patchState({
          error,
          loading: false,
          hasError: true,
          errorMessage: "Error al cargar los pagos. Por favor, inténtelo de nuevo.",
          payments: [],
          total: 0,
        });
        this.snackBarService.showError("Error al cargar los pagos", "Cerrar");
        return throwError(() => error);
      })
    );
  }

  @Action(SearchPaymentsByName, { cancelUncompleted: true })
  searchPaymentsByName(
    ctx: StateContext<PaymentsStateModel>,
    { searchTerm, filters }: SearchPaymentsByName
  ): Observable<PaymentsResponse> {
    ctx.patchState({
      loading: true,
      hasError: false,
      errorMessage: "",
      filters: filters,
    });

    return this.paymentsService.searchPaymentsByName(searchTerm, filters).pipe(
      tap((response: PaymentsResponse) => {
        ctx.patchState({
          payments: response.data.data,
          total: response.data.pagination.totalCount,
          currentPage: response.data.pagination.currentPage - 1, // Material paginator uses 0-based indexing
          pageSize: response.data.pagination.limit,
          pageCount: response.data.pagination.totalPages,
          loading: false,
        });
      }),
      catchError((error) => {
        ctx.patchState({
          error,
          loading: false,
          hasError: true,
          errorMessage: "Error al buscar los pagos. Por favor, inténtelo de nuevo.",
          payments: [],
          total: 0,
        });
        this.snackBarService.showError("Error al buscar los pagos", "Cerrar");
        return throwError(() => error);
      })
    );
  }

  @Action(GetPaymentsSummary, { cancelUncompleted: true })
  getPaymentsSummary(
    ctx: StateContext<PaymentsStateModel>,
    { startDate, endDate }: GetPaymentsSummary
  ): Observable<PaymentsSummary> {
    ctx.patchState({
      summaryLoading: true,
      summaryError: false,
    });

    return this.paymentsService.getPaymentsSummary(startDate, endDate).pipe(
      tap((summary: PaymentsSummary) => {
        ctx.patchState({
          summary,
          summaryLoading: false,
        });
      }),
      catchError((error) => {
        console.error("Error loading payments summary:", error);
        ctx.patchState({
          summaryError: true,
          summaryLoading: false,
          summary: null,
        });
        return throwError(() => error);
      })
    );
  }

  @Action(UpdatePayment, { cancelUncompleted: true })
  updatePayment(
    ctx: StateContext<PaymentsStateModel>,
    { paymentId, newAmount }: UpdatePayment
  ): Observable<any> {
    ctx.patchState({ loading: true });

    return this.paymentsService.updatePayment(paymentId, newAmount).pipe(
      tap((response) => {
        console.log("Payment updated successfully:", response);

        // Find the payment and get client name for success message
        const payments = ctx.getState().payments || [];
        const updatedPayment = payments.find((p) => p._id === paymentId);
        const clientName = updatedPayment?.clientName || "Cliente";

        // Update the payment in the state
        const updatedPayments = payments.map((payment) =>
          payment._id === paymentId ? { ...payment, amount: newAmount } : payment
        );

        ctx.patchState({
          payments: updatedPayments,
          loading: false,
        });

        this.snackBarService.showSuccess(
          `Pago de ${clientName} actualizado correctamente`,
          "Cerrar"
        );
      }),
      catchError((error) => {
        console.error("Error updating payment:", error);
        ctx.patchState({ loading: false });
        this.snackBarService.showError(
          "Error al actualizar el pago. Por favor, inténtelo de nuevo.",
          "Cerrar"
        );
        return throwError(() => error);
      })
    );
  }

  @Action(DeletePayment, { cancelUncompleted: true })
  deletePayment(
    ctx: StateContext<PaymentsStateModel>,
    { paymentId }: DeletePayment
  ): Observable<any> {
    ctx.patchState({ loading: true });

    return this.paymentsService.deletePayment(paymentId).pipe(
      tap((response) => {
        console.log("Payment deleted successfully:", response);

        const state = ctx.getState();
        const payments = state.payments || [];
        const deletedPayment = payments.find((p) => p._id === paymentId);
        const clientName = deletedPayment?.clientName || "Cliente";

        // Remove the payment from state
        const updatedPayments = payments.filter((payment) => payment._id !== paymentId);
        const newTotal = Math.max((state.total ?? 0) - 1, 0);

        ctx.patchState({
          payments: updatedPayments,
          total: newTotal,
          loading: false,
        });

        this.snackBarService.showSuccess(
          `Pago de ${clientName} eliminado correctamente`,
          "Cerrar"
        );
      }),
      catchError((error) => {
        console.error("Error deleting payment:", error);
        ctx.patchState({ loading: false });
        this.snackBarService.showError(
          "Error al eliminar el pago. Por favor, inténtelo de nuevo.",
          "Cerrar"
        );
        return throwError(() => error);
      })
    );
  }

  @Action(CreatePayment, { cancelUncompleted: true })
  createPayment(
    ctx: StateContext<PaymentsStateModel>,
    { amount, clientId, clientName }: CreatePayment
  ): Observable<any> {
    ctx.patchState({ loading: true });

    return this.paymentsService.createPayment(amount, clientId, clientName).pipe(
      tap((response) => {
        ctx.patchState({ loading: false });

        this.snackBarService.showSuccess(
          `Pago de ${clientName} registrado correctamente`,
          "Cerrar"
        );
      }),
      catchError((error) => {
        console.error("Error creating payment:", error);
        ctx.patchState({ loading: false });
        this.snackBarService.showError(
          "Error al registrar el pago. Por favor, inténtelo de nuevo.",
          "Cerrar"
        );
        return throwError(() => error);
      })
    );
  }

  @Action(ExportPayments)
  exportPayments(
    ctx: StateContext<PaymentsStateModel>,
    { filters, format }: ExportPayments
  ): Observable<Blob> {
    return this.paymentsService.exportPayments(filters, format).pipe(
      tap((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `pagos_${new Date().toISOString().split("T")[0]}.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.snackBarService.showSuccess("Archivo descargado exitosamente", "Cerrar");
      }),
      catchError((error) => {
        console.error("Error exporting payments:", error);
        this.snackBarService.showError("Error al exportar los datos", "Cerrar");
        return throwError(() => error);
      })
    );
  }

  @Action(SetPaymentsFilters)
  setFilters(
    ctx: StateContext<PaymentsStateModel>,
    { filters }: SetPaymentsFilters
  ) {
    ctx.patchState({ filters });
  }

  @Action(ClearPaymentsError)
  clearError(ctx: StateContext<PaymentsStateModel>) {
    ctx.patchState({
      error: null,
      hasError: false,
      errorMessage: "",
      summaryError: false,
    });
  }
}