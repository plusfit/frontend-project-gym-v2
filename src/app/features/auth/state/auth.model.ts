import {
  AuthResponse,
  UserPreferences,
  Organization,
} from '../interfaces/auth';

export class AuthStateModel {
  loading?: boolean;
  auth?: AuthResponse | null;
  preferences?: UserPreferences | null;
  organization?: Organization | null;
}
