import { UserRole } from '@core/enums/roles.enum';
import { Permission } from '@core/enums/permissions.enum';

// Re-export para evitar problemas de importación
export { Permission };

export interface NewPasswordRequest {
  userId: string | null;
  resetToken: string | null;
  password?: string | null;
}

export interface AuthCredentials {
  identifier: string;
  password: string;
}

export interface AuthResponse {
  refreshToken: string;
  accessToken: string;
  organization?: Organization | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface FirebaseAuthResponse {
  _tokenResponse: {
    idToken: string;
    refreshToken: string;
    expiresIn: string;
  };
}

export interface FirebaseRegisterResponse {
  user: any;
}

export interface User {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  needOnboarding: boolean;
  role: UserRole;
  organizationId?: string;
  organizationSlug?: string;
  permissions: Permission[];
}

export interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface Register {
  identifier: string;
  password: string;
  confirmPassowrd: string;
}
