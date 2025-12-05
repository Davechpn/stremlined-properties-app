/**
 * API Client
 * 
 * Axios HTTP client configured with:
 * - Base URL and timeout from environment
 * - Request/response interceptors for auth tokens
 * - Sentry performance monitoring
 * - Reactotron logging (development only)
 * - Automatic token refresh on 401 errors
 */

import { API_BASE_URL, API_TIMEOUT } from '@/constants/app';
import { clearSessionExpired, emitSessionExpired, isSessionExpired } from '@/services/auth/session-events';
import { logApiToReactotron } from '@/services/monitoring/reactotron';
import { logApiRequest } from '@/services/monitoring/sentry';
import { getRefreshToken, getToken, removeToken, storeToken } from '@/services/storage/secure-storage';
import * as Sentry from '@sentry/react-native';
import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('🔵 [API Client] Configured with baseURL:', API_BASE_URL, 'timeout:', API_TIMEOUT);

// Flag to prevent multiple simultaneous token refreshes
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor: Add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    console.log('🔵 [API Client] Request interceptor - starting', config.url);
    const startTime = Date.now();
    
    // Don't short-circuit auth endpoints (login/register/refresh/logout)
    const isAuthEndpoint = !!config.url && (
      config.url.includes('/auth/login') ||
      config.url.includes('/auth/register') ||
      config.url.includes('/auth/refresh') ||
      config.url.includes('/auth/logout')
    );

    // If the app has already marked the session expired, short-circuit
    // outgoing requests to avoid repeated retries/refresh attempts. Skip
    // this for auth endpoints so login/register still work.
    try {
      if (!isAuthEndpoint && isSessionExpired()) {
        const err = new Error('Session expired');

        // Wait briefly to allow the UI (RootLayout) to mount and consume
        // the session-expired event. If the flag is cleared within the
        // timeout, proceed with the request; otherwise reject.
        return new Promise((resolve, reject) => {
          const waitMs = 150;
          const t = setTimeout(() => {
            try {
              if (isSessionExpired()) {
                reject(err as any);
              } else {
                resolve(config);
              }
            } catch (e) {
              reject(err as any);
            }
          }, waitMs);

          // In case the request is cancelled externally, clear timeout
          // when promise settles (not strictly necessary here).
        });
      }
    } catch (e) {}

    // Add auth token if available
    const token = await getToken();
    console.log('🔵 [API Client] Token retrieved:', token ? 'exists' : 'none');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Store request start time for performance tracking
    if (config.headers) {
      config.headers['X-Request-Start-Time'] = startTime.toString();
    }

    console.log('🔵 [API Client] Request interceptor - completed');
    return config;
  },
  (error: AxiosError) => {
    console.log('🔴 [API Client] Request interceptor error:', error);
    Sentry.captureException(error, {
      tags: { api: 'request-interceptor' },
    });
    return Promise.reject(error);
  }
);

// Response interceptor: Log and handle errors
apiClient.interceptors.response.use(
  async (response: AxiosResponse) => {
    console.log('🟢 [API Client] Response received:', response.status, response.config.url);
    console.log('🟢 [API Client] Response data preview:', JSON.stringify(response.data).substring(0, 500));
    
    // Calculate request duration
    const startTime = response.config.headers?.['X-Request-Start-Time'];
    const duration = startTime ? Date.now() - parseInt(startTime as string, 10) : 0;

    // Log to Sentry and Reactotron
    logApiRequest(
      response.config.url || '',
      response.config.method?.toUpperCase() || 'GET',
      response.status
    );

    logApiToReactotron(
      response.config.method?.toUpperCase() || 'GET',
      response.config.url || '',
      response.config.data,
      response.data,
      duration
    );

    console.log('🟢 [API Client] Response interceptor completed');
    return response;
  },
  async (error: AxiosError) => {
    console.log('🔴 [API Client] Response error:', error.message, error.response?.status);
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Calculate request duration
    const startTime = originalRequest?.headers?.['X-Request-Start-Time'];
    const duration = startTime ? Date.now() - parseInt(startTime as string, 10) : 0;

    // Log to Sentry and Reactotron
    const status = error.response?.status || 0;
    logApiRequest(
      originalRequest?.url || '',
      originalRequest?.method?.toUpperCase() || 'GET',
      status
    );

    logApiToReactotron(
      originalRequest?.method?.toUpperCase() || 'GET',
      originalRequest?.url || '',
      originalRequest?.data,
      error.response?.data,
      duration
    );

    // Handle 401 Unauthorized - attempt token refresh
    // Skip token refresh for auth endpoints (login, register, etc.)
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || 
                           originalRequest?.url?.includes('/auth/register') ||
                           originalRequest?.url?.includes('/auth/refresh') ||
                           originalRequest?.url?.includes('/auth/logout');
    
    // Check if error is related to invalid/expired tokens
    const errorData = error.response?.data as any;
    const isTokenError = status === 401 || 
                        (status === 500 && 
                         (errorData?.message?.toLowerCase().includes('token') ||
                          errorData?.errors?.some((e: string) => e.toLowerCase().includes('token'))));
    
    if (isTokenError && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      console.log('🔴 [API Client] Token error detected - attempting token refresh');
      if (isRefreshing) {
        // Queue this request until token refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        
        if (!refreshToken) {
          console.log('🔴 [API Client] No refresh token available - clearing auth');
          // No refresh token, user needs to re-authenticate
          await removeToken();
          // Notify app that session expired so UI can navigate to sign-in
          try {
            emitSessionExpired();
          } catch (e) {}
          processQueue(new Error('No refresh token available'), null);
          return Promise.reject(error);
        }

        console.log('🔵 [API Client] Attempting to refresh token');
        // Attempt to refresh token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        await storeToken(accessToken);
        // Clear session-expired flag now that refresh succeeded
        try {
          clearSessionExpired();
        } catch (e) {}

        console.log('🟢 [API Client] Token refreshed successfully');
        
        // Update authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        processQueue(null, accessToken);
        isRefreshing = false;

        // Retry original request with new token
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.log('🔴 [API Client] Token refresh failed - clearing auth');
        // Token refresh failed, user needs to re-authenticate
        processQueue(refreshError as Error, null);
        await removeToken();
        isRefreshing = false;
        
        // Notify app that session expired so UI can navigate to sign-in
        try {
          emitSessionExpired();
        } catch (e) {}

        Sentry.captureException(refreshError, {
          tags: { api: 'token-refresh-failed' },
        });
        
        return Promise.reject(refreshError);
      }
    }

    // For auth endpoints or other errors, just reject without refresh attempt
    if (isAuthEndpoint) {
      console.log('🔴 [API Client] Auth endpoint error - skipping token refresh');
    }

    // Capture non-401 errors in Sentry
    if (status >= 500) {
      Sentry.captureException(error, {
        tags: { api: 'server-error' },
        extra: {
          url: originalRequest?.url,
          method: originalRequest?.method,
          status,
        },
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
