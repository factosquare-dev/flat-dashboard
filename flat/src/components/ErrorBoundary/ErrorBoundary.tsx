import React, { Component } from 'react';
import { logger } from '../../utils/logger';
import type { ErrorBoundaryProps, ErrorBoundaryState } from './types';
import { PageErrorView, SectionErrorView, ComponentErrorView } from './ErrorViews';

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private previousResetKeys: Array<string | number> = [];

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
    this.previousResetKeys = props.resetKeys || [];
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
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

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
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
        key => prevProps[key as keyof ErrorBoundaryProps] !== this.props[key as keyof ErrorBoundaryProps]
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
        return <SectionErrorView state={this.state} onRetry={this.handleRetry} />;
      }

      if (this.props.level === 'component') {
        return <ComponentErrorView onRetry={this.handleRetry} />;
      }

      // Default page-level error UI
      return <PageErrorView state={this.state} onRetry={this.handleRetry} showErrorDetails={this.props.showErrorDetails} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;