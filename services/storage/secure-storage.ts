/**
 * Secure Storage Wrapper
 * 
 * Provides encrypted storage for sensitive data using Expo SecureStore.
 * All authentication tokens and credentials should be stored here.
 */

import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/constants/auth';
import * as Sentry from '@sentry/react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Store authentication token securely
 */
export async function storeToken(token: string): Promise<boolean> {
  try {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    return true;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { storage: 'secure', operation: 'storeToken' },
    });
    console.error('Failed to store auth token:', error);
    return false;
  }
}

/**
 * Retrieve authentication token
 */
export async function getToken(): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    return token;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { storage: 'secure', operation: 'getToken' },
    });
    console.error('Failed to retrieve auth token:', error);
    return null;
  }
}

/**
 * Remove authentication token
 */
export async function removeToken(): Promise<boolean> {
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    return true;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { storage: 'secure', operation: 'removeToken' },
    });
    console.error('Failed to remove auth token:', error);
    return false;
  }
}

/**
 * Store refresh token securely
 */
export async function storeRefreshToken(token: string): Promise<boolean> {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    return true;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { storage: 'secure', operation: 'storeRefreshToken' },
    });
    console.error('Failed to store refresh token:', error);
    return false;
  }
}

/**
 * Retrieve refresh token
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    return token;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { storage: 'secure', operation: 'getRefreshToken' },
    });
    console.error('Failed to retrieve refresh token:', error);
    return null;
  }
}

/**
 * Remove refresh token
 */
export async function removeRefreshToken(): Promise<boolean> {
  try {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    return true;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { storage: 'secure', operation: 'removeRefreshToken' },
    });
    console.error('Failed to remove refresh token:', error);
    return false;
  }
}

/**
 * Clear all secure storage data
 */
export async function clearSecureStorage(): Promise<boolean> {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(AUTH_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
    return true;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { storage: 'secure', operation: 'clearAll' },
    });
    console.error('Failed to clear secure storage:', error);
    return false;
  }
}
