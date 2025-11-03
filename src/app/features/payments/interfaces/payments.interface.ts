export interface PaymentItem {
  _id: string;
  clientId: string;
  clientName: string;
  amount: number;
  createdAt: string;
}

// Backend response format - estructura real del backend
// Backend response format - estructura exacta del endpoint
export interface PaymentsResponse {
  success: boolean;
  data: {
    data: PaymentItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      limit: number;
    };
  };
}

export interface PaymentsFilters {
  page: number;
  limit: number;
  startDate?: string; // Format: YYYY-MM-DD
  endDate?: string;   // Format: YYYY-MM-DD
}

export interface PaymentsStats {
  totalPayments: number;
  totalAmount: number;
  averagePayment: number;
  paymentsToday: number;
  paymentsThisMonth: number;
}

export interface PaymentsSummary {
  totalAmount: number;
  count: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface PaymentsSummaryResponse {
  success: boolean;
  data: PaymentsSummary;
}

export interface PaymentTableColumn {
  key: string;
  label: string;
  sortable: boolean;
  type: "text" | "date" | "currency" | "number";
  width?: string;
}