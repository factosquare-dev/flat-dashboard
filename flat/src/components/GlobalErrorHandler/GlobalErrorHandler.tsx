import { useEffect } from 'react';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { logger } from '../../utils/logger';

export const GlobalErrorHandler: React.FC = () => {
  const { handleError } = useErrorHandler();

  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error('Unhandled promise rejection', {
        reason: event.reason,
        promise: event.promise,
      });
      
      handleError(event.reason);
      
      // Prevent default browser error handling
      event.preventDefault();
    };

    // Handle global errors
    const handleGlobalError = (event: ErrorEvent) => {
      logger.error('Global error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
      
      handleError(event.error || new Error(event.message));
      
      // Prevent default browser error handling
      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
    };
  }, [handleError]);

  // This component doesn't render anything
  return null;
};