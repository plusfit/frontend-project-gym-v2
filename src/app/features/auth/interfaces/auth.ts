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
  data: {
    refreshToken: string;
    accessToken: string;
  };
  success: boolean;
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
  role: Role;
}

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

interface Permission {
  name: string;
  id: string;
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
