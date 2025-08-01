import React from 'react';
// Alert component removed, using inline styling instead
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import type { ErrorBoundaryState } from './types';
import { ButtonVariant, ModalSize } from '@/types/enums';

interface ErrorViewProps {
  state: ErrorBoundaryState;
  onRetry: () => void;
  showErrorDetails?: boolean;
}

export const PageErrorView: React.FC<ErrorViewProps> = ({ state, onRetry, showErrorDetails = import.meta.env.DEV }) => {
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
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              We're sorry, but something unexpected happened. Please try again or contact support if the problem persists.
            </p>
          </div>
          
          {state.eventId && (
            <div className="text-xs text-gray-500 text-center">
              Error ID: {state.eventId}
            </div>
          )}
          
          {showErrorDetails && state.error && (
            <details className="bg-gray-50 p-4 rounded-md">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 flex items-center">
                <Bug className="h-4 w-4 mr-2" />
                Error Details {!import.meta.env.DEV && '(Development Only)'}
              </summary>
              <div className="mt-4 space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Error Message:</h4>
                  <pre className="mt-1 text-sm text-red-600 bg-red-50 p-2 rounded overflow-auto">
                    {state.error.message}
                  </pre>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Stack Trace:</h4>
                  <pre className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-auto max-h-32">
                    {state.error.stack}
                  </pre>
                </div>
                {state.errorInfo && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Component Stack:</h4>
                    <pre className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-auto max-h-32">
                      {state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={onRetry} 
              variant={ButtonVariant.PRIMARY}
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

export const SectionErrorView: React.FC<ErrorViewProps> = ({ state, onRetry }) => {
  return (
    <div className="rounded-lg bg-red-50 p-4 border border-red-200">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Section Error</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>This section encountered an error and couldn't be displayed.</p>
            {state.eventId && (
              <p className="text-xs mt-1">Error ID: {state.eventId}</p>
            )}
          </div>
          <div className="mt-4">
            <Button
              onClick={onRetry}
              variant="outline"
              size={ModalSize.SM}
              className="bg-red-100 hover:bg-red-200 text-red-800 border-red-300"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ComponentErrorView: React.FC<Pick<ErrorViewProps, 'onRetry'>> = ({ onRetry }) => {
  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 border border-red-200">
      <AlertTriangle className="h-4 w-4 mr-2" />
      <span>Component Error</span>
      <button
        onClick={onRetry}
        className="ml-2 text-red-600 hover:text-red-800 transition-colors"
        title="Retry"
      >
        <RefreshCw className="h-3 w-3" />
      </button>
    </div>
  );
};