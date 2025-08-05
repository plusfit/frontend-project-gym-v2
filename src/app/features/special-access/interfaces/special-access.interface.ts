export interface SpecialAccessInfo {
  accessTime: Date;
  userAgent: string;
  ipAddress?: string;
  sessionId?: string;
}

export interface SpecialAccessFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
  requiredPermissions?: string[];
}

export interface SpecialAccessConfig {
  maxAccessTime?: number; // in minutes
  allowedRoles?: string[];
  logAccess?: boolean;
  restrictedFeatures?: string[];
}

// Gym Access Interfaces
export interface GymAccessRequest {
  cedula: string;
}

export interface ClientAccessInfo {
  name: string;
  photo?: string;
  plan?: string;
  consecutiveDays: number;
  totalAccesses: number;
}

export interface RewardInfo {
  name: string;
  description: string;
  requiredDays: number;
}

export interface GymAccessResponse {
  success: boolean;
  message: string;
  client?: ClientAccessInfo;
  reward?: RewardInfo;
  reason?: string;
}

export interface GymAccessFormState {
  cedula: string;
  isValid: boolean;
  isLoading: boolean;
  response?: GymAccessResponse;
  showResult: boolean;
}