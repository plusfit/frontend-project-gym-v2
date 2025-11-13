import { PaymentItem, PaymentsSummary, PaymentsFilters } from "../interfaces/payments.interface";

export class PaymentsStateModel {
  loading?: boolean;
  payments?: PaymentItem[];
  selectedPayment?: PaymentItem | null;
  summary?: PaymentsSummary | null;
  summaryLoading?: boolean;
  summaryError?: boolean;
  total?: number;
  currentPage?: number;
  pageSize?: number;
  pageCount?: number;
  error?: any;
  filters?: PaymentsFilters | null;
  hasError?: boolean;
  errorMessage?: string;
}