import { AuthCredentials, NewPasswordRequest } from '../interfaces/auth';

export class Login {
  static readonly type = '[Auth] Login';
  constructor(public readonly payload: AuthCredentials) {}
}

export class ForgotPassword {
  static readonly type = '[Auth] Forgot Password';
  constructor(public readonly payload: { email: string }) {}
}

export class ResetPassword {
  static readonly type = '[Auth] Reset Password';
  constructor(public readonly payload: NewPasswordRequest) {}
}

export class Logout {
  static readonly type = '[Auth] Logout';
}

export class GetUserPreferences {
  static readonly type = '[Auth] Get User Preferences';
}
