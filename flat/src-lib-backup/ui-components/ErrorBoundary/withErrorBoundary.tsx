import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import type { ErrorInfo } from 'react';

interface WithErrorBoundaryOptions {
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: WithErrorBoundaryOptions
) {
  const WrappedComponent = (props: P) => {
    return (
      <ErrorBoundary fallback={options?.fallback} onError={options?.onError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}