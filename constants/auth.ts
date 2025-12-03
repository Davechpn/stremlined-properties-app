// Authentication constants

export const AUTH_TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const USER_DATA_KEY = 'user_data';
export const ACTIVE_ORG_KEY = 'active_org';
export const HAS_SEEN_ONBOARDING_KEY = 'has_seen_onboarding';
export const SESSION_DURATION_SHORT = 60 * 60 * 1000; // 1 hour in milliseconds
export const SESSION_DURATION_LONG = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSpecialChar: true,
};

export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 10;
export const OTP_RESEND_DELAY_SECONDS = 60;
export const MAX_OTP_ATTEMPTS = 3;
export const MAX_LOGIN_ATTEMPTS = 5;

export const PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 24;
