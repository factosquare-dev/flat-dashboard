import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { ErrorFallback } from './ErrorFallback';

interface PageErrorBoundaryProps {
  children: React.ReactNode;
}

export const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({ children }) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Additional page-level error handling
    console.error('Page-level error:', error, errorInfo);
  };

  return (
    <ErrorBoundary 
      fallback={ErrorFallback}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
};