import { logAuthFlowToReactotron } from '@/services/monitoring/reactotron';
import { logAuthEvent } from '@/services/monitoring/sentry';
import type { ApiError } from '@/types/api';
import type { GoogleOAuthResponse } from '@/types/auth';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

// Complete web browser session for OAuth redirect
WebBrowser.maybeCompleteAuthSession();

/**
 * Google OAuth Service
 * 
 * Handles Google OAuth authentication flow using Expo AuthSession.
 * Supports iOS, Android, and web platforms.
 * 
 * Configuration required in app.json:
 * - scheme: streamlinedproperties
 * - Android: Google Services JSON
 * - iOS: URL schemes and reversed client ID
 */

// OAuth configuration (these should come from environment variables)
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_ID_IOS = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '';
const GOOGLE_CLIENT_ID_ANDROID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '';

// OAuth endpoints
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

/**
 * Get platform-specific Google Client ID
 */
function getClientId(): string {
  if (Platform.OS === 'ios') {
    return GOOGLE_CLIENT_ID_IOS || GOOGLE_CLIENT_ID;
  }
  if (Platform.OS === 'android') {
    return GOOGLE_CLIENT_ID_ANDROID || GOOGLE_CLIENT_ID;
  }
  return GOOGLE_CLIENT_ID;
}

/**
 * Create OAuth redirect URI for current platform
 */
function getRedirectUri(): string {
  return AuthSession.makeRedirectUri({
    scheme: 'streamlinedproperties',
    path: 'auth/callback',
  });
}

/**
 * Initiate Google OAuth flow
 * 
 * @returns Google OAuth response with authorization code or error
 */
export async function initiateGoogleOAuth(): Promise<GoogleOAuthResponse> {
  try {
    const clientId = getClientId();
    const redirectUri = getRedirectUri();

    logAuthFlowToReactotron('Google OAuth started', {
      clientId: clientId.substring(0, 20) + '...',
      redirectUri,
      platform: Platform.OS,
    });

    // Create auth request
    const request = new AuthSession.AuthRequest({
      clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    });

    // Prompt user for authorization
    const result = await request.promptAsync(discovery);

    if (result.type === 'success') {
      const { code } = result.params;

      logAuthFlowToReactotron('Google OAuth successful', {
        hasCode: !!code,
        codeLength: code?.length || 0,
      });

      logAuthEvent('signin', 'google');

      return {
        code,
        redirectUri,
        codeVerifier: request.codeVerifier,
      };
    }

    if (result.type === 'error') {
      const errorMessage = result.params.error_description || result.params.error || 'OAuth failed';
      
      logAuthFlowToReactotron('Google OAuth failed', {
        error: errorMessage,
        errorType: result.params.error,
      });

      logAuthEvent('auth_failure', 'google', new Error(errorMessage));

      return {
        error: {
          message: errorMessage,
          code: result.params.error || 'OAUTH_ERROR',
          statusCode: 401,
        },
      };
    }

    // User cancelled
    logAuthFlowToReactotron('Google OAuth cancelled', { type: result.type });

    return {
      error: {
        message: 'OAuth authentication cancelled by user',
        code: 'OAUTH_CANCELLED',
        statusCode: 401,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown OAuth error';

    logAuthFlowToReactotron('Google OAuth error', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    logAuthEvent('auth_failure', 'google', error instanceof Error ? error : new Error(errorMessage));

    return {
      error: {
        message: errorMessage,
        code: 'OAUTH_EXCEPTION',
        statusCode: 500,
      },
    };
  }
}

/**
 * Exchange authorization code for access token
 * 
 * Note: This should typically be done on the backend for security.
 * The backend receives the code and exchanges it server-side.
 * 
 * @param code Authorization code from OAuth flow
 * @param codeVerifier PKCE code verifier
 * @returns Access token response
 */
export async function exchangeCodeForToken(
  code: string,
  codeVerifier?: string
): Promise<{ accessToken: string; idToken: string } | ApiError> {
  try {
    const clientId = getClientId();
    const redirectUri = getRedirectUri();

    const tokenResponse = await AuthSession.exchangeCodeAsync(
      {
        code,
        clientId,
        redirectUri,
        extraParams: codeVerifier ? { code_verifier: codeVerifier } : {},
      },
      discovery
    );

    logAuthFlowToReactotron('Token exchange successful', {
      hasAccessToken: !!tokenResponse.accessToken,
      hasIdToken: !!tokenResponse.idToken,
      expiresIn: tokenResponse.expiresIn,
    });

    return {
      accessToken: tokenResponse.accessToken,
      idToken: tokenResponse.idToken || '',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Token exchange failed';

    logAuthFlowToReactotron('Token exchange failed', {
      error: errorMessage,
    });

    return {
      message: errorMessage,
      code: 'TOKEN_EXCHANGE_ERROR',
      statusCode: 500,
    };
  }
}

/**
 * Revoke Google OAuth access token
 * 
 * @param token Access token to revoke
 */
export async function revokeGoogleOAuth(token: string): Promise<void> {
  try {
    await AuthSession.revokeAsync(
      { token },
      discovery
    );

    logAuthFlowToReactotron('Google OAuth revoked', { success: true });
  } catch (error) {
    logAuthFlowToReactotron('Google OAuth revocation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
