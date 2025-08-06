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

export interface GymAccessStats {
  overview: {
    totalAccessesToday: number;
    totalAccessesThisWeek: number;
    totalAccessesThisMonth: number;
    uniqueClientsToday: number;
    uniqueClientsThisMonth: number;
    averageSuccessRate: number;
    peakHour: number;
  };
  dailyStats: {
    date: string;
    totalAccesses: number;
    successfulAccesses: number;
    failedAccesses: number;
    uniqueClients: number;
  }[];
  weeklyStats: {
    week: string;
    totalAccesses: number;
    successfulAccesses: number;
    failedAccesses: number;
    uniqueClients: number;
  }[];
  monthlyStats: {
    month: string;
    totalAccesses: number;
    successfulAccesses: number;
    failedAccesses: number;
    uniqueClients: number;
  }[];
  topClients: {
    clientName: string;
    cedula: string;
    totalAccesses: number;
    consecutiveDays: number;
    lastAccess?: string;
  }[];
  popularTimes: {
    hour: number;
    accessCount: number;
  }[];
  rewardStats: {
    totalRewardsEarned: number;
    activeRewards: number;
    rewardsByType: {
      type: string;
      count: number;
    }[];
    topRewardEarners: {
      clientName: string;
      cedula: string;
      rewardCount: number;
    }[];
  };
}

// Backend stats response format - check if backend wraps in success object
export interface GymAccessStatsResponse {
  success: boolean;
  data: GymAccessStats;
  message?: string;
}

// Direct stats response (if backend doesn't wrap in success object)
export interface DirectGymAccessStatsResponse extends GymAccessStats {}

export interface StatsPeriod {
  startDate: string;
  endDate: string;
  period: 'daily' | 'weekly' | 'monthly';
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
    stats: {
      totalAccesses: number;
      consecutiveDays: number;
      lastAccess?: string;
      firstAccess?: string;
      averageAccessesPerWeek: number;
      rewardsEarned: number;
    };
  };
  message?: string;
}

export interface ExportOptions {
  format: 'csv' | 'excel';
  filters: AccessFilters;
  includeStats?: boolean;
}

export interface AccessTableColumn {
  key: string;
  label: string;
  sortable: boolean;
  type: 'text' | 'date' | 'badge' | 'boolean' | 'number';
  width?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    tension?: number;
  }[];
}

export interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  trend?: {
    value: number;
    direction: 'up' | 'down';
    period: string;
  };
}