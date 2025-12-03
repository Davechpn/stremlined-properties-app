/**
 * Authentication API hooks using TanStack Query
 */

import { USER_DATA_KEY } from '@/constants/auth';
import { logAuthFlowToReactotron } from '@/services/monitoring/reactotron';
import { logAuthEvent } from '@/services/monitoring/sentry';
import { removeItem, setItem } from '@/services/storage/async-storage';
import { removeRefreshToken, removeToken, storeRefreshToken, storeToken } from '@/services/storage/secure-storage';
import type { ApiResponse } from '@/types/api';
import type { AuthCredentials, AuthenticationResponse, PasswordReset, PasswordResetRequest, SignUpCredentials, User } from '@/types/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import apiClient from './client';

/**
 * Validate authentication response for empty/invalid data
 * API sometimes returns 200 with empty tokens instead of proper 401
 * 
 * Example invalid response:
 * {
 *   "accessToken": "",
 *   "refreshToken": "",
 *   "expiresAt": "0001-01-01T00:00:00",
 *   "user": {
 *     "id": "00000000-0000-0000-0000-000000000000",
 *     "name": "",
 *     "email": null,
 *     "isActive": false
 *   }
 * }
 */
const isValidAuthResponse = (response: AuthenticationResponse): boolean => {
  // Check if access token exists and is not empty
  if (!response.accessToken || response.accessToken.trim() === '') {
    logAuthFlowToReactotron('Invalid auth response: Empty access token', { response });
    return false;
  }

  // Check if refresh token exists and is not empty
  if (!response.refreshToken || response.refreshToken.trim() === '') {
    logAuthFlowToReactotron('Invalid auth response: Empty refresh token', { response });
    return false;
  }

  // Check if user ID is valid (not all zeros)
  if (!response.user?.id || response.user.id === '00000000-0000-0000-0000-000000000000') {
    logAuthFlowToReactotron('Invalid auth response: Invalid user ID', { userId: response.user?.id });
    return false;
  }

  // Check if expiresAt is valid (not the zero date "0001-01-01T00:00:00")
  if (response.expiresAt && (
    response.expiresAt === '0001-01-01T00:00:00' ||
    response.expiresAt.startsWith('0001-01-01')
  )) {
    logAuthFlowToReactotron('Invalid auth response: Invalid expiration date', { expiresAt: response.expiresAt });
    return false;
  }

  // Check if user has a valid email or phone number
  if (!response.user.email && !response.user.phoneNumber) {
    logAuthFlowToReactotron('Invalid auth response: No email or phone number', { userId: response.user.id });
    return false;
  }

  return true;
};

/**
 * Sign up with email and password
 */
export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: SignUpCredentials) => {
      logAuthFlowToReactotron('Sign up started', { email: credentials.email });
      
      const response = await apiClient.post<AuthenticationResponse>('/auth/register', {
        email: credentials.email,
        password: credentials.password,
        confirmPassword: credentials.confirmPassword,
        name: credentials.name,
        // Optional organization and contact fields
        organizationName: credentials.organizationName || undefined,
        organizationDescription: credentials.organizationDescription || undefined,
        website: credentials.website || undefined,
        phoneNumber: credentials.phoneNumber || undefined,
        address: credentials.address || undefined,
        city: credentials.city || undefined,
        state: credentials.state || undefined,
        country: credentials.country || undefined,
      });

      if (!response.data) throw new Error('No data returned from API');
      
      // Validate response for empty/invalid authentication data
      if (!isValidAuthResponse(response.data)) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }
      
      return response.data;
    },
    onSuccess: async (authResponse) => {
      // Store tokens
      await storeToken(authResponse.accessToken);
      await storeRefreshToken(authResponse.refreshToken);
      
      // Cache user data
      await setItem(USER_DATA_KEY, authResponse.user);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });

      // Log success
      logAuthEvent('signup', 'email');
      logAuthFlowToReactotron('Sign up successful', { userId: authResponse.user.id });
      
      // Haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => {
      logAuthEvent('signup', 'email', error as Error);
      logAuthFlowToReactotron('Sign up failed', { error: (error as Error).message });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

/**
 * Sign in with email and password
 */
export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: AuthCredentials) => {
      console.log('🔵 [useSignIn] mutationFn started');
      logAuthFlowToReactotron('Sign in started', { email: credentials.email });

      console.log('🔵 [useSignIn] Making API call...');
      try {
        const response = await apiClient.post<AuthenticationResponse>('/auth/login', {
          email: credentials.email,
          password: credentials.password,
          rememberMe: credentials.rememberMe,
        });
        console.log('🔵 [useSignIn] API call completed, response:', response.data);

        if (!response.data) {
          console.log('🔴 [useSignIn] No data in response');
          throw new Error('No data returned from API');
        }
        
        console.log('🔵 [useSignIn] Validating response...');
        // Validate response for empty/invalid authentication data
        if (!isValidAuthResponse(response.data)) {
          console.log('🔴 [useSignIn] Invalid auth response detected');
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
        
        console.log('🟢 [useSignIn] Response validated successfully');
        return response.data;
      } catch (error: any) {
        console.log('🔴 [useSignIn] API call failed:', error.message);
        console.log('🔴 [useSignIn] Error code:', error.code);
        console.log('🔴 [useSignIn] Error response:', error.response?.status);
        throw error;
      }
    },
    onSuccess: async (authResponse) => {
      console.log('🟢 [useSignIn] onSuccess called');
      // Store tokens
      await storeToken(authResponse.accessToken);
      await storeRefreshToken(authResponse.refreshToken);
      
      // Cache user data
      await setItem(USER_DATA_KEY, authResponse.user);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });

      // Log success
      logAuthEvent('signin', 'email');
      logAuthFlowToReactotron('Sign in successful', { userId: authResponse.user.id });
      
      // Haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log('🟢 [useSignIn] onSuccess completed');
    },
    onError: (error) => {
      console.log('🔴 [useSignIn] onError called:', error);
      logAuthEvent('auth_failure', 'email', error as Error);
      logAuthFlowToReactotron('Sign in failed', { 
        error: (error as Error).message,
        // @ts-ignore - error may have response property
        statusCode: error?.response?.status 
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

/**
 * Sign out
 */
export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logoutFromAllDevices: boolean = true) => {
      logAuthFlowToReactotron('Sign out started', { logoutFromAllDevices });

      await apiClient.post('/auth/logout', {
        logoutFromAllDevices,
      });
    },
    onSuccess: async () => {
      // Clear tokens
      await removeToken();
      await removeRefreshToken();
      
      // Clear user data
      await removeItem(USER_DATA_KEY);

      // Clear all queries
      queryClient.clear();

      // Log success
      logAuthEvent('signout', 'email');
      logAuthFlowToReactotron('Sign out successful');
    },
    onError: (error) => {
      logAuthFlowToReactotron('Sign out failed', { error: (error as Error).message });
    },
  });
}

/**
 * Request password reset
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (request: PasswordResetRequest) => {
      logAuthFlowToReactotron('Password reset requested', { email: request.email });

      const response = await apiClient.post<ApiResponse>('/auth/forgot-password', request);

      return response.data;
    },
    onSuccess: () => {
      logAuthEvent('password_reset', 'email');
      logAuthFlowToReactotron('Password reset email sent');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => {
      logAuthFlowToReactotron('Password reset request failed', { error: (error as Error).message });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

/**
 * Reset password with token
 */
export function useResetPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reset: PasswordReset) => {
      logAuthFlowToReactotron('Password reset submission', { email: reset.email });

      const response = await apiClient.post<ApiResponse<void>>('/auth/reset-password', {
        email: reset.email,
        resetToken: reset.resetToken,
        password: reset.password,
        confirmPassword: reset.confirmPassword,
      });

      // Password reset API doesn't return authentication tokens
      // User needs to sign in again
      return response.data;
    },
    onSuccess: async () => {
      // Log success
      logAuthEvent('password_reset', 'email');
      logAuthFlowToReactotron('Password reset successful, please sign in');
      
      // Haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => {
      logAuthFlowToReactotron('Password reset failed', { error: (error as Error).message });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

/**
 * Get current user profile
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await apiClient.get<User>('/auth/profile');
      if (!response.data) throw new Error('No data returned from API');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
