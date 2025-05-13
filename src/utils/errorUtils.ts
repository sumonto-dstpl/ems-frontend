import { AxiosError } from 'axios';

/**
 * Format API error messages into user-friendly formats
 */
export const formatApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    // Handle Axios errors
    if (error.response) {
      // Server responded with an error status
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 401) {
        return 'Your session has expired. Please log in again.';
      } else if (status === 403) {
        return 'You do not have permission to perform this action.';
      } else if (status === 404) {
        return 'The requested resource was not found.';
      } else if (status === 422) {
        // Validation errors
        if (data.errors && Array.isArray(data.errors)) {
          return data.errors.map((err: any) => err.message).join('. ');
        }
        return data.message || 'Validation failed. Please check your input.';
      } else if (status >= 500) {
        return 'Server error. Please try again later or contact support.';
      }
      
      // Generic error with message
      return data.message || 'An error occurred while processing your request.';
    } else if (error.request) {
      // Request was made but no response received
      return 'No response from server. Please check your internet connection.';
    }
  }
  
  // Generic error
  return error instanceof Error 
    ? error.message 
    : 'An unexpected error occurred. Please try again.';
};

/**
 * Format validation errors for form fields
 */
export const formatValidationErrors = (errors: Record<string, string[]>): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};
  
  Object.keys(errors).forEach(key => {
    formattedErrors[key] = errors[key].join('. ');
  });
  
  return formattedErrors;
};

/**
 * Check if the error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return !error.response && !!error.request;
  }
  return false;
};

/**
 * Check if the error is an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  if (error instanceof AxiosError && error.response) {
    return error.response.status === 401;
  }
  return false;
};

/**
 * Determine if the user should be prompted to retry
 */
export const shouldPromptRetry = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    // Network errors can be retried
    if (!error.response && !!error.request) {
      return true;
    }
    
    // Server errors can be retried
    if (error.response && error.response.status >= 500) {
      return true;
    }
  }
  
  return false;
};