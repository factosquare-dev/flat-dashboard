import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface ComponentErrorBoundaryProps {
  children: React.ReactNode;
  componentName?: string;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

const ComponentErrorFallback: React.FC<{ error: Error; resetError: () => void; componentName?: string }> = ({ 
  error, 
  resetError,
  componentName 
}) => {
  return (
    <div className="inline-flex items-center gap-2 p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span title={error.message}>
        {componentName ? `${componentName} 오류` : '컴포넌트 오류'}
      </span>
      <button
        onClick={resetError}
        className="ml-2 text-xs underline hover:no-underline"
      >
        재시도
      </button>
    </div>
  );
};

// Create a named component for the default fallback
const createDefaultFallback = (componentName?: string): React.ComponentType<{ error: Error; resetError: () => void }> => {
  const DefaultFallback: React.FC<{ error: Error; resetError: () => void }> = (props) => (
    <ComponentErrorFallback {...props} componentName={componentName} />
  );
  DefaultFallback.displayName = `DefaultFallback(${componentName || 'Component'})`;
  return DefaultFallback;
};

export const ComponentErrorBoundary: React.FC<ComponentErrorBoundaryProps> = ({ 
  children, 
  componentName,
  fallback 
}) => {
  // Use provided fallback or create a proper component (not an inline function)
  const FallbackComponent = fallback || createDefaultFallback(componentName);

  return (
    <ErrorBoundary fallback={FallbackComponent}>
      {children}
    </ErrorBoundary>
  );
};