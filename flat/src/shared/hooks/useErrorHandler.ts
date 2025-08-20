import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  handleError, 
  getUserFriendlyMessage, 
  isRetryableError,
  AppError,
  ERROR_CODES 
} from '@/shared/utils/error/errorHandler';
import { storageKeys } from '@/config';

interface UseErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  redirectOn401?: boolean;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const navigate = useNavigate();
  const {
    showToast = true,
    logError = true,
    redirectOn401 = true,
  } = options;

  const handleErrorWithOptions = useCallback((error: unknown, customMessage?: string) => {
    const appError = handleError(error);
    
    // Handle authentication errors
    if (redirectOn401 && appError.code === ERROR_CODES.UNAUTHORIZED) {
      // Clear auth token
      localStorage.removeItem(storageKeys.tokenKey);
      // Redirect to login
      navigate('/login', { state: { from: window.location.pathname } });
      return appError;
    }

    // Show toast notification
    if (showToast) {
      const message = customMessage || getUserFriendlyMessage(appError);
      
      if (isRetryableError(appError)) {
        toast.error(message, {
          duration: 5000,
          icon: '🔄',
        });
      } else {
        toast.error(message, {
          duration: 4000,
          icon: '❌',
        });
      }
    }

    return appError;
  }, [navigate, showToast, redirectOn401]);

  return {
    handleError: handleErrorWithOptions,
    AppError,
    ERROR_CODES,
  };
}

// Hook for async operations with error handling
export function useAsyncError() {
  const { handleError } = useErrorHandler();

  const throwError = useCallback((error: unknown) => {
    handleError(error);
    throw error;
  }, [handleError]);

  return throwError;
}