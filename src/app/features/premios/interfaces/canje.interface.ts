export interface Canje {
  id: string;
  premioId: string;
  premioName: string;
  clienteId: string;
  clienteName: string;
  clienteEmail: string;
  adminId?: string;
  adminName?: string;
  pointsUsed: number;
  canjeDate: Date;
  status: 'completed' | 'pending' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface CanjeFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'completed' | 'pending' | 'cancelled' | 'all';
  clientId?: string;
  premioId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CanjeResponse {
  success: boolean;
  data: Canje[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}

export interface CreateCanjeRequest {
  premioId: string;
  clienteId: string;
  adminId?: string;
}

export interface CanjeResult {
  success: boolean;
  message: string;
  data?: {
    canje: Canje;
    puntosRestantes: number;
  };
}