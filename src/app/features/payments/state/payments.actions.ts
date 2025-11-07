import { PaymentsFilters } from "../interfaces/payments.interface";

export class GetPayments {
  static readonly type = "[Payments] Get Payments";
  constructor(public readonly filters: PaymentsFilters) { }
}

export class SearchPaymentsByName {
  static readonly type = "[Payments] Search Payments By Name";
  constructor(
    public readonly searchTerm: string,
    public readonly filters: PaymentsFilters
  ) { }
}

export class GetPaymentsSummary {
  static readonly type = "[Payments] Get Payments Summary";
  constructor(
    public readonly startDate?: string,
    public readonly endDate?: string
  ) { }
}

export class UpdatePayment {
  static readonly type = "[Payments] Update Payment";
  constructor(
    public readonly paymentId: string,
    public readonly newAmount: number
  ) { }
}

export class DeletePayment {
  static readonly type = "[Payments] Delete Payment";
  constructor(public readonly paymentId: string) { }
}

export class CreatePayment {
  static readonly type = "[Payments] Create Payment";
  constructor(
    public readonly amount: number,
    public readonly clientId: string,
    public readonly clientName: string
  ) { }
}

export class ExportPayments {
  static readonly type = "[Payments] Export Payments";
  constructor(
    public readonly filters: PaymentsFilters,
    public readonly format: "csv" | "excel"
  ) { }
}

export class SetPaymentsFilters {
  static readonly type = "[Payments] Set Filters";
  constructor(public readonly filters: PaymentsFilters) { }
}

export class ClearPaymentsError {
  static readonly type = "[Payments] Clear Error";
}