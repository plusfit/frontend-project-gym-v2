export interface Premio {
  id: string;
  name: string;
  description?: string;
  pointsRequired: number;
  enabled: boolean;
  totalCanjes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PremioFilters {
  search?: string;
  enabled?: boolean;
  page?: number;
  limit?: number;
}

export interface PremioResponse {
  success: boolean;
  data: {
    success: boolean;
    data: Premio[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      limit: number;
    };
  };
}

export interface CreatePremioRequest {
  name: string;
  description?: string;
  pointsRequired: number;
  enabled?: boolean;
}

export interface UpdatePremioRequest {
  name?: string;
  description?: string;
  pointsRequired?: number;
  enabled?: boolean;
}

export interface PremioApiResponse {
  success: boolean;
  message: string;
  data?: Premio;
}