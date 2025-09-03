export interface Reward {
  id: string;
  name: string;
  description?: string;
  pointsRequired: number;
  enabled: boolean;
  totalCanjes: number;
  imageUrl?: string;
  imagePath?: string;
  mediaType?: 'image' | 'video';
  createdAt: Date;
  updatedAt: Date;
}

export interface RewardFilters {
  search?: string;
  enabled?: boolean;
  page?: number;
  limit?: number;
}

export interface RewardResponse {
  success: boolean;
  data: {
    success: boolean;
    data: Reward[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      limit: number;
    };
  };
}

export interface CreateRewardRequest {
  name: string;
  description?: string;
  pointsRequired: number;
  enabled?: boolean;
  imageUrl?: string;
  imagePath?: string;
  mediaType?: 'image' | 'video';
}

export interface UpdateRewardRequest {
  name?: string;
  description?: string;
  pointsRequired?: number;
  enabled?: boolean;
  imageUrl?: string;
  imagePath?: string;
  mediaType?: 'image' | 'video';
}

export interface RewardApiResponse {
  success: boolean;
  message: string;
  data?: Reward;
}