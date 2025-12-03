// Error handling utilities

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  details?: Record<string, any>;
}

/**
 * Parse API error response to user-friendly message
 */
export const parseApiError = (error: any): string => {
  // Handle network errors
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Network connection error. Please check your internet connection and try again.';
  }

  // Handle timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  // Handle API response errors
  if (error.response) {
    const { status, data } = error.response;

    // Handle specific status codes
    switch (status) {
      case 400:
        return data?.message || 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication failed. Please sign in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return data?.message || 'The requested resource was not found.';
      case 409:
        return data?.message || 'A conflict occurred. This resource may already exist.';
      case 422:
        return data?.message || 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return data?.message || `An error occurred (${status}). Please try again.`;
    }
  }

  // Handle generic errors
  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Parse validation errors from API response
 */
export const parseValidationErrors = (error: any): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    error.response.data.errors.forEach((err: ApiError) => {
      if (err.field) {
        errors[err.field] = err.message;
      }
    });
  }

  return errors;
};

/**
 * Check if error is authentication error (401)
 */
export const isAuthError = (error: any): boolean => {
  return error.response?.status === 401;
};

/**
 * Check if error is network error
 */
export const isNetworkError = (error: any): boolean => {
  return (
    error.code === 'ERR_NETWORK' ||
    error.message === 'Network Error' ||
    !error.response
  );
};

/**
 * Get user-friendly error message for common authentication errors
 */
export const getAuthErrorMessage = (error: any): string => {
  const apiMessage = error.response?.data?.message;
  const status = error.response?.status;

  // Use API message if available
  if (apiMessage) {
    return apiMessage;
  }

  // Handle specific status codes
  if (status === 401) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }

  if (status === 403) {
    return 'Your account has been disabled. Please contact support.';
  }

  if (status === 409) {
    return 'This email is already registered. Please sign in or use a different email.';
  }

  if (status === 422) {
    return 'Please check your email and password format.';
  }

  if (status === 429) {
    return 'Too many login attempts. Please wait a few minutes and try again.';
  }

  if (status === 500 || status === 503) {
    return 'Server error. Please try again in a few moments.';
  }

  // Fall back to generic error parsing
  return parseApiError(error);
};
