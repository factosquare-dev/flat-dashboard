import React, { Component, ReactNode } from 'react';
import { logger } from '../utils/logger';
import { Alert } from './ui/Alert';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
  isolate?: boolean;
  level?: 'page' | 'section' | 'component';
  showErrorDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
  eventId?: string;
}

// Type alias for backward compatibility
interface Props extends ErrorBoundaryProps {}

class ErrorBoundary extends Component<Props, State> {
  private previousResetKeys: Array<string | number> = [];

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
    this.previousResetKeys = props.resetKeys || [];
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      eventId: Math.random().toString(36).substring(2, 15),
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log the error
    logger.error('Error caught by ErrorBoundary', error, {
      component: 'ErrorBoundary',
      level: this.props.level || 'component',
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      eventId: this.state.eventId,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });

    // Report to error tracking service if in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with error tracking service (e.g., Sentry)
      // Sentry.captureException(error, { extra: errorInfo });
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error state if resetKeys changed
    if (hasError && resetKeys && resetKeys !== this.previousResetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== this.previousResetKeys[index]
      );

      if (hasResetKeyChanged) {
        this.previousResetKeys = resetKeys;
        this.handleRetry();
      }
    }

    // Reset error state if any props changed (when resetOnPropsChange is true)
    if (hasError && resetOnPropsChange) {
      const propsChanged = Object.keys(prevProps).some(
        key => prevProps[key as keyof Props] !== this.props[key as keyof Props]
      );

      if (propsChanged) {
        this.handleRetry();
      }
    }
  }

  handleRetry = () => {
    logger.info('User clicked retry in ErrorBoundary', {
      component: 'ErrorBoundary',
      action: 'retry',
      eventId: this.state.eventId,
    });

    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      eventId: undefined,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Render different UI based on level
      if (this.props.level === 'section') {
        return this.renderSectionError();
      }

      if (this.props.level === 'component') {
        return this.renderComponentError();
      }

      // Default page-level error UI
      return this.renderPageError();
    }

    return this.props.children;
  }

  private renderPageError = () => {
    const { showErrorDetails = import.meta.env.DEV } = this.props;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl">Something went wrong</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="error" description="We're sorry, but something unexpected happened. Please try again or contact support if the problem persists." />
            
            {this.state.eventId && (
              <div className="text-xs text-gray-500 text-center">
                Error ID: {this.state.eventId}
              </div>
            )}
            
            {showErrorDetails && this.state.error && (
              <details className="bg-gray-50 p-4 rounded-md">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 flex items-center">
                  <Bug className="h-4 w-4 mr-2" />
                  Error Details {!import.meta.env.DEV && '(Development Only)'}
                </summary>
                <div className="mt-4 space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Error Message:</h4>
                    <pre className="mt-1 text-sm text-red-600 bg-red-50 p-2 rounded overflow-auto">
                      {this.state.error.message}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Stack Trace:</h4>
                    <pre className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Component Stack:</h4>
                      <pre className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-auto max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={this.handleRetry} 
                variant="primary"
                leftIcon={<RefreshCw className="h-4 w-4" />}
                className="flex-1"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => window.location.href = '/'} 
                variant="outline"
                leftIcon={<Home className="h-4 w-4" />}
                className="flex-1"
              >
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  private renderSectionError = () => (
    <div className="rounded-lg bg-red-50 p-4 border border-red-200">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Section Error</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>This section encountered an error and couldn't be displayed.</p>
            {this.state.eventId && (
              <p className="text-xs mt-1">Error ID: {this.state.eventId}</p>
            )}
          </div>
          <div className="mt-4">
            <Button
              onClick={this.handleRetry}
              variant="outline"
              size="sm"
              className="bg-red-100 hover:bg-red-200 text-red-800 border-red-300"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  private renderComponentError = () => (
    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 border border-red-200">
      <AlertTriangle className="h-4 w-4 mr-2" />
      <span>Component Error</span>
      <button
        onClick={this.handleRetry}
        className="ml-2 text-red-600 hover:text-red-800 transition-colors"
        title="Retry"
      >
        <RefreshCw className="h-3 w-3" />
      </button>
    </div>
  );
}

// Higher-order component for wrapping components with error boundaries
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

// Specialized error boundaries for different levels
export const PageErrorBoundary: React.FC<Omit<ErrorBoundaryProps, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="page" />
);

export const SectionErrorBoundary: React.FC<Omit<ErrorBoundaryProps, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="section" />
);

export const ComponentErrorBoundary: React.FC<Omit<ErrorBoundaryProps, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="component" isolate />
);

export default ErrorBoundary;