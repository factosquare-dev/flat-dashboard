import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/shared/utils/logger';
import { handleError as utilHandleError } from '@/shared/utils/error/errorHandler';
import { AppError } from '@/shared/utils/error';
import { ErrorFallback } from './ErrorFallback';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Use our new error handling
    handleError(error, 'ErrorBoundary');
    
    // Log detailed error information
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      isAppError: error instanceof AppError,
      errorCode: error instanceof AppError ? error.code : undefined,
    };
    
    logger.error('React ErrorBoundary caught error', errorDetails);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || ErrorFallback;
      
      // Check if FallbackComponent is a React element (JSX) instead of a component
      if (React.isValidElement(FallbackComponent)) {
        console.warn('[ErrorBoundary] FallbackComponent is a React element, not a component. Using default fallback.');
        return (
          <ErrorFallback
            error={this.state.error}
            resetError={this.resetError}
          />
        );
      }
      
      // Type guard to ensure FallbackComponent is a valid component function
      if (typeof FallbackComponent !== 'function') {
        console.error('[ErrorBoundary] Invalid FallbackComponent type:', typeof FallbackComponent, FallbackComponent);
        return (
          <ErrorFallback
            error={this.state.error}
            resetError={this.resetError}
          />
        );
      }
      
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}