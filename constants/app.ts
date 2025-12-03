// App-wide constants

// Production API URL
export const API_BASE_URL = process.env.API_BASE_URL || 'https://streamlined-properties.com/api/v1';
export const API_TIMEOUT = Number(process.env.API_TIMEOUT) || 30000;

export const SENTRY_DSN = process.env.SENTRY_DSN || '';
export const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || 'development';

export const DEEP_LINK_SCHEME = 'streamlinedproperties';
export const DEEP_LINK_PREFIX = `${DEEP_LINK_SCHEME}://`;

export const APP_NAME = 'Streamlined Properties';
export const APP_VERSION = '1.0.0';

export const INVITATION_EXPIRY_DAYS = 14;
export const MAX_ORGANIZATIONS_PER_USER = 50;
export const MAX_PROFILE_PHOTO_SIZE_MB = 5;
export const PROFILE_PHOTO_MAX_WIDTH = 800;
export const PROFILE_PHOTO_MAX_HEIGHT = 800;

export const CACHE_EXPIRY_DAYS = 7;
export const QUERY_STALE_TIME = 5 * 60 * 1000; // 5 minutes
export const QUERY_CACHE_TIME = 30 * 60 * 1000; // 30 minutes

export const PERFORMANCE_TARGET_SCREEN_LOAD_MS = 2000;
export const PERFORMANCE_TARGET_APP_STARTUP_MS = 3000;
export const PERFORMANCE_TARGET_FPS = 60;
