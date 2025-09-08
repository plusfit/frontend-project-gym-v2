export interface Exchange {
  id: string;
  rewardId: string;
  rewardName: string;
  rewardImageUrl?: string;
  rewardImagePath?: string;
  rewardMediaType?: 'image' | 'video';
  clientId: string;
  clientName: string;
  clientEmail: string;
  adminId?: string;
  adminName?: string;
  pointsUsed: number;
  exchangeDate: Date;
  status: 'completed' | 'pending' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface ExchangeFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'completed' | 'pending' | 'cancelled' | 'all';
  clientId?: string;
  rewardId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ExchangeResponse {
  success: boolean;
  data: {
    success: boolean;
    data: Exchange[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      limit: number;
    };
  };
}

export interface CreateExchangeRequest {
  rewardId: string;
  clientId: string;
  adminId?: string;
}

export interface ExchangeResult {
  success: boolean;
  message: string;
  data?: {
    exchange: Exchange;
    remainingPoints: number;
  };
}