import { AuthResponse, UserPreferences } from '../interfaces/auth';

export class AuthStateModel {
  loading?: boolean;
  auth?: AuthResponse | null;
  preferences?: UserPreferences | null;
}
