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
  authorize?: boolean;
  client?: ClientAccessInfo;
  reward?: RewardInfo;
  reason?: string;
  denialType?: 'client_not_found' | 'client_disabled' | 'already_accessed' | 'outside_hours' | 'system_error';
}

// Raw API Response Structure
export interface ApiResponse {
  success: boolean;
  data?:
    | {
        message: string;
        authorize?: boolean;
        client?: ClientAccessInfo;
        reward?: RewardInfo;
        reason?: string;
      }
    | string; // data can be an object or a string for errors
}

export interface GymAccessFormState {
  cedula: string;
  isValid: boolean;
  isLoading: boolean;
  response?: GymAccessResponse;
  showResult: boolean;
}
