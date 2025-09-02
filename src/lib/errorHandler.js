// Error types
export const ERROR_TYPES = {
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  VALIDATION: 'validation',
  NOT_FOUND: 'not_found',
  SERVER: 'server',
  NETWORK: 'network',
  UNKNOWN: 'unknown',
};

// Function to determine the error type
export const getErrorType = (error) => {
  if (!error) return ERROR_TYPES.UNKNOWN;

  // Check for Supabase authentication errors
  if (error.code === 'auth/invalid-email' || 
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password' ||
      error.message?.includes('Invalid login credentials')) {
    return ERROR_TYPES.AUTHENTICATION;
  }

  // Check for authorization errors
  if (error.code === 'auth/insufficient-permissions' ||
      error.status === 403 ||
      error.message?.includes('permission')) {
    return ERROR_TYPES.AUTHORIZATION;
  }

  // Check for validation errors
  if (error.code === 'validation-failed' ||
      error.status === 400 ||
      error.message?.includes('validation')) {
    return ERROR_TYPES.VALIDATION;
  }

  // Check for not found errors
  if (error.code === 'not-found' ||
      error.status === 404 ||
      error.message?.includes('not found')) {
    return ERROR_TYPES.NOT_FOUND;
  }

  // Check for server errors
  if (error.status >= 500 || 
      error.message?.includes('server error')) {
    return ERROR_TYPES.SERVER;
  }

  // Check for network errors
  if (error.message?.includes('network') ||
      error.message?.includes('connection') ||
      error.code === 'ECONNREFUSED') {
    return ERROR_TYPES.NETWORK;
  }

  return ERROR_TYPES.UNKNOWN;
};

// Function to get a user-friendly error message
export const getUserFriendlyErrorMessage = (error) => {
  const errorType = getErrorType(error);
  
  switch (errorType) {
    case ERROR_TYPES.AUTHENTICATION:
      return 'Invalid email or password. Please check your credentials and try again.';
    
    case ERROR_TYPES.AUTHORIZATION:
      return 'You do not have permission to perform this action.';
    
    case ERROR_TYPES.VALIDATION:
      return error.message || 'Please check your input and try again.';
    
    case ERROR_TYPES.NOT_FOUND:
      return 'The requested resource was not found.';
    
    case ERROR_TYPES.SERVER:
      return 'A server error occurred. Please try again later.';
    
    case ERROR_TYPES.NETWORK:
      return 'A network error occurred. Please check your internet connection and try again.';
    
    case ERROR_TYPES.UNKNOWN:
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
};

// Function to handle errors
export const handleError = (error, options = {}) => {
  const { logError = true, throwError = false } = options;
  
  // Log the error
  if (logError) {
    console.error('Error:', error);
  }
  
  // Get the user-friendly error message
  const message = getUserFriendlyErrorMessage(error);
  
  // Throw the error if requested
  if (throwError) {
    throw new Error(message);
  }
  
  return {
    type: getErrorType(error),
    message,
    originalError: error,
  };
};

export default {
  ERROR_TYPES,
  getErrorType,
  getUserFriendlyErrorMessage,
  handleError,
};

