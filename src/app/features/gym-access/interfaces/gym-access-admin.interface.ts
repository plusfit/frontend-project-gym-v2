export interface GymAccessHistoryItem {
  _id: string;
  cedula: string;
  clientName: string;
  clientPhoto?: string;
  planName: string;
  success: boolean;
  reason?: string;
  accessDate: string;
  rewardEarned?: {
    name: string;
    description: string;
    type: string;
  };
  consecutiveDays?: number;
  totalAccesses?: number;
}

export interface GymAccessHistoryResponse {
  success: boolean;
  data: {
    history: GymAccessHistoryItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      limit: number;
    };
  };
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
  dailyStats: {
    date: string;
    totalAccesses: number;
    uniqueClients: number;
    successfulAccesses: number;
    failedAccesses: number;
    successRate: number;
  }[];
  weeklyStats: {
    week: string;
    totalAccesses: number;
    uniqueClients: number;
    averageDailyAccesses: number;
  }[];
  monthlyStats: {
    month: string;
    totalAccesses: number;
    uniqueClients: number;
    averageDailyAccesses: number;
  }[];
  popularTimes: {
    hour: number;
    accessCount: number;
    percentage: number;
  }[];
  topClients: {
    clientName: string;
    cedula: string;
    totalAccesses: number;
    consecutiveDays: number;
    lastAccess: string;
  }[];
  rewardStats: {
    totalRewardsEarned: number;
    rewardsByType: {
      type: string;
      count: number;
    }[];
    topRewardEarners: {
      clientName: string;
      cedula: string;
      rewardsEarned: number;
    }[];
  };
  overview: {
    totalAccessesToday: number;
    totalAccessesThisWeek: number;
    totalAccessesThisMonth: number;
    uniqueClientsToday: number;
    uniqueClientsThisWeek: number;
    uniqueClientsThisMonth: number;
    averageSuccessRate: number;
    peakHour: number;
  };
}

export interface GymAccessStatsResponse {
  success: boolean;
  data: GymAccessStats;
  message?: string;
}

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