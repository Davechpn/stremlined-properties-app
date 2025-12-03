/**
 * Authentication types matching API schema
 */

export enum AuthMethod {
  EMAIL_PASSWORD = 'Email',
  GOOGLE_OAUTH = 'Google',
  PHONE_OTP = 'Phone',
}

export enum UserStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended',
  PENDING_VERIFICATION = 'PendingVerification',
}

export interface User {
  id: string;
  name: string;
  email?: string | null;
  phoneNumber?: string | null;
  profilePhotoUrl?: string | null;
  authenticationMethods: string[];
  lastActiveAt: string;
  createdAt: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

export interface OrganizationMembership {
  id: string;
  organizationId: string;
  organizationName: string;
  user: User;
  organization: {
    id: string;
    name: string;
    description: string | null;
    owner: User;
    lastActiveAt: string;
    createdAt: string;
    isActive: boolean;
    settings: {
      timezone: string;
      currency: string;
    };
    memberCount: number;
  };
  role: string;
  status: string;
  joinedAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface AuthenticationResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
  organizations: OrganizationMembership[];
}

export interface AuthCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  organizationName?: string;
  organizationDescription?: string;
  website?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  timezone?: string;
  currency?: string;
}

export interface Session {
  id: string;
  tokenId: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  ipAddress: string;
  deviceInfo?: string;
  lastUsedAt: string;
}

export interface OTPRequest {
  phoneNumber: string;
}

export interface OTPVerification {
  verificationId: string;
  code: string;
  phoneNumber: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  email: string;
  resetToken: string;
  password: string;
  confirmPassword: string;
}

export interface GoogleOAuthStart {
  redirectUri: string;
  state?: string;
}

export interface GoogleOAuthComplete {
  code: string;
  state: string;
}

export interface GoogleOAuthResponse {
  code?: string;
  redirectUri?: string;
  codeVerifier?: string;
  error?: {
    message: string;
    code: string;
    statusCode: number;
  };
}
