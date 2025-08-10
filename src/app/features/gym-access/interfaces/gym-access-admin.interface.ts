export interface GymAccessHistoryItem {
  id: string;
  clientId: string;
  cedula: string;
  clientName: string;
  clientPhoto?: string;
  accessDate: string;
  accessDay: string;
  successful: boolean;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

// Backend response format - matches exactly what backend returns
export interface GymAccessHistoryResponse {
  history: GymAccessHistoryItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}

// Alternative interface for wrapped responses (if backend uses success wrapper)
export interface WrappedGymAccessHistoryResponse {
  success: boolean;
  data: GymAccessHistoryResponse;
  message?: string;
}

export interface AccessFilters {
  page: number;
  limit: number;
  startDate?: string;
  endDate?: string;
  clientName?: string;
  successful?: boolean;
  cedula?: string;
}

export interface ClientAccessHistoryResponse {
  success: boolean;
  data: {
    client: {
      name: string;
      cedula: string;
      planName: string;
      photo?: string;
    };
    history: GymAccessHistoryItem[];
  };
  message?: string;
}

export interface ExportOptions {
  format: "csv" | "excel";
  filters: AccessFilters;
}

export interface AccessTableColumn {
  key: string;
  label: string;
  sortable: boolean;
  type: "text" | "date" | "badge" | "boolean" | "number";
  width?: string;
}

export interface AccessStats {
  totalAccessesToday: number;
  totalAccessesThisMonth: number;
  averageAccessesPerDay: number;
  totalAccesses: number;
  successfulAccesses: number;
  failedAccesses: number;
  mostActiveClients: {
    clientName: string;
    cedula: string;
    totalAccesses: number;
  }[];
}
