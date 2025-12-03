import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const SENTRY_DSN = process.env.SENTRY_DSN || '';
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || 'development';
const SENTRY_ENABLED = process.env.SENTRY_ENABLED === 'true';

/**
 * Initialize Sentry SDK for error tracking and performance monitoring
 */
export const initializeSentry = () => {
  if (!SENTRY_ENABLED || !SENTRY_DSN) {
    console.log('[Sentry] Disabled or DSN not configured');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    debug: __DEV__,
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    beforeSend(event) {
      // Remove sensitive data from error reports
      if (event.request?.headers) {
        delete event.request.headers.Authorization;
        delete event.request.headers.Cookie;
      }
      return event;
    },
  });

  // Set release information
  Sentry.setTag('appVersion', Constants.expoConfig?.version || '1.0.0');
  Sentry.setTag('platform', Constants.platform?.ios ? 'ios' : 'android');
};

/**
 * Log authentication events to Sentry
 */
export const logAuthEvent = (
  eventType: 'signup' | 'signin' | 'signout' | 'password_reset' | 'auth_failure',
  method?: 'email' | 'google' | 'phone',
  error?: Error
) => {
  const breadcrumb: Sentry.Breadcrumb = {
    type: 'user',
    category: 'auth',
    message: `${eventType}${method ? ` via ${method}` : ''}`,
    level: error ? 'error' : 'info',
  };

  Sentry.addBreadcrumb(breadcrumb);

  if (error) {
    Sentry.captureException(error, {
      tags: { authEvent: eventType, authMethod: method },
    });
  }
};

/**
 * Log navigation events to Sentry
 */
export const logNavigationEvent = (screenName: string) => {
  Sentry.addBreadcrumb({
    type: 'navigation',
    category: 'navigation',
    message: `Navigated to ${screenName}`,
    level: 'info',
  });
};

/**
 * Log API requests to Sentry
 */
export const logApiRequest = (url: string, method: string, statusCode?: number) => {
  Sentry.addBreadcrumb({
    type: 'http',
    category: 'api',
    message: `${method} ${url}`,
    level: statusCode && statusCode >= 400 ? 'error' : 'info',
    data: { statusCode },
  });
};

/**
 * Set user context in Sentry
 */
export const setSentryUser = (userId: string, email?: string, organizationId?: string) => {
  Sentry.setUser({
    id: userId,
    email,
  });

  if (organizationId) {
    Sentry.setTag('activeOrganization', organizationId);
  }
};

/**
 * Clear user context from Sentry (on logout)
 */
export const clearSentryUser = () => {
  Sentry.setUser(null);
  Sentry.setTag('activeOrganization', '');
};

/**
 * Track custom events
 */
export const trackEvent = (eventName: string, data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    type: 'user',
    category: 'custom',
    message: eventName,
    data,
    level: 'info',
  });
};

export { Sentry };
