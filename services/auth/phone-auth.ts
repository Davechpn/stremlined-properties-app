import apiClient from '@/services/api/client';
import { logAuthFlowToReactotron } from '@/services/monitoring/reactotron';
import { logAuthEvent } from '@/services/monitoring/sentry';
import type { ApiResponse } from '@/types/api';
import type { OTPRequest, OTPVerification } from '@/types/auth';

/**
 * Phone Authentication Service
 * 
 * Handles phone/OTP authentication flow:
 * 1. Request OTP: Send SMS with 6-digit code
 * 2. Verify OTP: Validate code and authenticate user
 * 3. Resend OTP: Send new code if expired/lost
 * 
 * Rate limiting:
 * - Max 3 OTP requests per phone number per hour
 * - Max 5 verification attempts per OTP
 * - 60-second cooldown between resend requests
 */

/**
 * Request OTP via SMS
 * 
 * Sends a 6-digit OTP code to the provided phone number.
 * 
 * @param request Phone number in E.164 format (e.g., +1234567890)
 * @returns Success response with OTP expiration time
 */
export async function requestOTP(
  request: OTPRequest
): Promise<ApiResponse<{ expiresAt: string; cooldownSeconds: number }>> {
  try {
    logAuthFlowToReactotron('OTP requested', {
      phone: request.phone.replace(/\d(?=\d{4})/g, '*'), // Mask phone number
    });

    const response = await apiClient.post<
      ApiResponse<{ expiresAt: string; cooldownSeconds: number }>
    >('/auth/otp/request', request);

    logAuthFlowToReactotron('OTP sent successfully', {
      expiresAt: response.data.data?.expiresAt,
      cooldownSeconds: response.data.data?.cooldownSeconds,
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || 'Failed to request OTP';

    logAuthFlowToReactotron('OTP request failed', {
      error: errorMessage,
      statusCode: error.response?.status,
    });

    logAuthEvent('auth_failure', 'phone', error instanceof Error ? error : new Error(errorMessage));

    throw error;
  }
}

/**
 * Verify OTP code
 * 
 * Validates the OTP code and authenticates the user.
 * Returns access token and refresh token on success.
 * 
 * @param verification Phone number and OTP code
 * @returns Session with tokens and user data
 */
export async function verifyOTP(
  verification: OTPVerification
): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
  try {
    logAuthFlowToReactotron('OTP verification started', {
      phone: verification.phone.replace(/\d(?=\d{4})/g, '*'),
      codeLength: verification.code.length,
    });

    const response = await apiClient.post<
      ApiResponse<{ accessToken: string; refreshToken: string }>
    >('/auth/otp/verify', verification);

    logAuthFlowToReactotron('OTP verification successful', {
      hasAccessToken: !!response.data.data?.accessToken,
      hasRefreshToken: !!response.data.data?.refreshToken,
    });

    logAuthEvent('signin', 'phone');

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || 'OTP verification failed';

    logAuthFlowToReactotron('OTP verification failed', {
      error: errorMessage,
      statusCode: error.response?.status,
      remainingAttempts: error.response?.data?.remainingAttempts,
    });

    logAuthEvent('auth_failure', 'phone', error instanceof Error ? error : new Error(errorMessage));

    throw error;
  }
}

/**
 * Resend OTP code
 * 
 * Sends a new OTP code to the same phone number.
 * Subject to cooldown period (60 seconds by default).
 * 
 * @param request Phone number in E.164 format
 * @returns Success response with new expiration time
 */
export async function resendOTP(
  request: OTPRequest
): Promise<ApiResponse<{ expiresAt: string; cooldownSeconds: number }>> {
  try {
    logAuthFlowToReactotron('OTP resend requested', {
      phone: request.phone.replace(/\d(?=\d{4})/g, '*'),
    });

    const response = await apiClient.post<
      ApiResponse<{ expiresAt: string; cooldownSeconds: number }>
    >('/auth/otp/resend', request);

    logAuthFlowToReactotron('OTP resent successfully', {
      expiresAt: response.data.data?.expiresAt,
      cooldownSeconds: response.data.data?.cooldownSeconds,
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || 'Failed to resend OTP';

    logAuthFlowToReactotron('OTP resend failed', {
      error: errorMessage,
      statusCode: error.response?.status,
      cooldownRemaining: error.response?.data?.cooldownRemaining,
    });

    logAuthEvent('auth_failure', 'phone', error instanceof Error ? error : new Error(errorMessage));

    throw error;
  }
}

/**
 * Check OTP rate limit status
 * 
 * Returns remaining requests and cooldown information
 * without actually sending an OTP.
 * 
 * @param phone Phone number in E.164 format
 * @returns Rate limit status
 */
export async function checkOTPRateLimit(
  phone: string
): Promise<
  ApiResponse<{
    remainingRequests: number;
    cooldownSeconds: number;
    canRequest: boolean;
  }>
> {
  try {
    const response = await apiClient.get<
      ApiResponse<{
        remainingRequests: number;
        cooldownSeconds: number;
        canRequest: boolean;
      }>
    >('/auth/otp/rate-limit', {
      params: { phone },
    });

    logAuthFlowToReactotron('OTP rate limit checked', {
      phone: phone.replace(/\d(?=\d{4})/g, '*'),
      canRequest: response.data.data?.canRequest,
      remainingRequests: response.data.data?.remainingRequests,
    });

    return response.data;
  } catch (error: any) {
    logAuthFlowToReactotron('OTP rate limit check failed', {
      error: error.message,
    });

    throw error;
  }
}
