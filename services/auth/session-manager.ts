import apiClient from '@/services/api/client';
import { logAuthFlowToReactotron } from '@/services/monitoring/reactotron';
import { logAuthEvent } from '@/services/monitoring/sentry';
import { getRefreshToken, getToken, removeRefreshToken, removeToken, storeRefreshToken, storeToken } from '@/services/storage/secure-storage';
import type { ApiResponse } from '@/types/api';
import type { Session } from '@/types/auth';

/**
 * Session Manager Service
 * 
 * Handles session validation, token refresh, and expiration.
 * Automatically refreshes expired tokens and manages session lifecycle.
 * 
 * Features:
 * - Automatic token refresh before expiration
 * - Session validation
 * - Token expiration checking
 * - Session extension for "Remember Me"
 */

const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiration

/**
 * Check if access token is expired or about to expire
 * 
 * @param expiresAt ISO timestamp when token expires
 * @returns true if token is expired or will expire within threshold
 */
export function isTokenExpired(expiresAt: string): boolean {
  const expirationTime = new Date(expiresAt).getTime();
  const currentTime = Date.now();
  const timeUntilExpiration = expirationTime - currentTime;

  return timeUntilExpiration <= TOKEN_REFRESH_THRESHOLD_MS;
}

/**
 * Validate current session
 * 
 * Checks if access token exists and is valid.
 * Attempts to refresh if expired.
 * 
 * @returns true if session is valid, false otherwise
 */
export async function validateSession(): Promise<boolean> {
  try {
    const accessToken = await getToken();

    if (!accessToken) {
      logAuthFlowToReactotron('Session validation failed', { reason: 'No access token' });
      return false;
    }

    // TODO: Decode JWT to check expiration without API call
    // For now, attempt API call to validate token
    try {
      await apiClient.get('/auth/validate');
      
      logAuthFlowToReactotron('Session validated', { valid: true });
      return true;
    } catch (error: any) {
      // If 401, token is invalid - try refresh
      if (error.response?.status === 401) {
        logAuthFlowToReactotron('Access token invalid, attempting refresh', {});
        return await refreshAccessToken();
      }

      // Other errors - consider session invalid
      logAuthFlowToReactotron('Session validation error', {
        error: error.message,
        statusCode: error.response?.status,
      });
      return false;
    }
  } catch (error) {
    logAuthFlowToReactotron('Session validation exception', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

/**
 * Refresh access token using refresh token
 * 
 * Exchanges refresh token for new access token and refresh token.
 * Updates stored tokens automatically.
 * 
 * @returns true if refresh successful, false otherwise
 */
export async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      logAuthFlowToReactotron('Token refresh failed', { reason: 'No refresh token' });
      return false;
    }

    logAuthFlowToReactotron('Token refresh started', {});

    const response = await apiClient.post<ApiResponse<Session>>('/auth/refresh', {
      refreshToken,
    });

    const session = response.data.data;

    if (!session) {
      throw new Error('No session data in refresh response');
    }

    // Store new tokens
    await storeToken(session.accessToken);
    await storeRefreshToken(session.refreshToken);

    logAuthFlowToReactotron('Token refresh successful', {
      expiresAt: session.expiresAt,
    });

    return true;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Token refresh failed';

    logAuthFlowToReactotron('Token refresh failed', {
      error: errorMessage,
      statusCode: error.response?.status,
    });

    logAuthEvent('auth_failure', 'email', error instanceof Error ? error : new Error(errorMessage));

    // Clear invalid tokens
    await removeToken();
    await removeRefreshToken();

    return false;
  }
}

/**
 * Extend session duration
 * 
 * Used when user enables "Remember Me" after signing in.
 * Requests backend to extend session to 7 days.
 * 
 * @returns Extended session or null if failed
 */
export async function extendSession(): Promise<Session | null> {
  try {
    logAuthFlowToReactotron('Session extension requested', {});

    const response = await apiClient.post<ApiResponse<Session>>('/auth/extend-session');

    const session = response.data.data;

    if (!session) {
      throw new Error('No session data in extension response');
    }

    // Update tokens with extended expiration
    await storeToken(session.accessToken);
    await storeRefreshToken(session.refreshToken);

    logAuthFlowToReactotron('Session extended successfully', {
      expiresAt: session.expiresAt,
    });

    return session;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Session extension failed';

    logAuthFlowToReactotron('Session extension failed', {
      error: errorMessage,
      statusCode: error.response?.status,
    });

    return null;
  }
}

/**
 * Clear session
 * 
 * Removes all tokens from secure storage.
 * Used during sign out or when session becomes invalid.
 */
export async function clearSession(): Promise<void> {
  try {
    await removeToken();
    await removeRefreshToken();

    logAuthFlowToReactotron('Session cleared', {});
  } catch (error) {
    logAuthFlowToReactotron('Session clear failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get session expiration time
 * 
 * @returns ISO timestamp when session expires, or null if no session
 */
export async function getSessionExpiration(): Promise<string | null> {
  try {
    const accessToken = await getToken();

    if (!accessToken) {
      return null;
    }

    // TODO: Decode JWT to extract expiration
    // For now, fetch from API
    const response = await apiClient.get<ApiResponse<{ expiresAt: string }>>('/auth/session-info');

    return response.data.data?.expiresAt || null;
  } catch (error) {
    logAuthFlowToReactotron('Session expiration check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}
