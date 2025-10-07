import { RefreshTokenPayload } from '@core/interfaces/refresh-token.interface';
import { AuthCredentials, NewPasswordRequest } from '../interfaces/auth';

export class Login {
  static readonly type = '[Auth] Login';
  constructor(public readonly payload: AuthCredentials) {}
}

export class ForgotPassword {
  static readonly type = '[Auth] Forgot Password';
  constructor(public readonly email: string ) {}
}

export class ResetPassword {
  static readonly type = '[Auth] Reset Password';
  constructor(public readonly payload: NewPasswordRequest) {}
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class Logout {
  static readonly type = '[Auth] Logout';
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class GetUserPreferences {
  static readonly type = '[Auth] Get User Preferences';
}

export class Register {
  static readonly type = '[Auth] Register';
  constructor(public readonly payload: AuthCredentials) {}
}

export class GetNewToken {
  static readonly type = '[Auth] Get New Token';
  constructor(public readonly payload: RefreshTokenPayload) {}
}

export class SetMockAuth {
  static readonly type = '[Auth] Set Mock Auth';
  constructor(public readonly payload: { accessToken: string; refreshToken?: string }) {}
}
