import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '@/utils/cn';
import { ModalSize } from '@/types/enums';

interface LoadingStateProps {
  isLoading: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  error,
  isEmpty = false,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  className
}) => {
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center min-h-[200px]', className)}>
        {loadingComponent || <LoadingSpinner size={ModalSize.LG} />}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex flex-col items-center justify-center min-h-[200px] text-center', className)}>
        {errorComponent || (
          <>
            <div className="text-red-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">오류가 발생했습니다</h3>
            <p className="text-sm text-gray-600">{error.message}</p>
          </>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={cn('flex flex-col items-center justify-center min-h-[200px] text-center', className)}>
        {emptyComponent || (
          <>
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">데이터가 없습니다</h3>
            <p className="text-sm text-gray-600">표시할 항목이 없습니다</p>
          </>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

interface AsyncBoundaryProps {
  isLoading: boolean;
  error?: Error | null;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  children: React.ReactNode;
}

export const AsyncBoundary: React.FC<AsyncBoundaryProps> = ({
  isLoading,
  error,
  fallback,
  errorFallback,
  children
}) => {
  if (isLoading) {
    return <>{fallback || <LoadingSpinner />}</>;
  }

  if (error) {
    return (
      <>
        {errorFallback || (
          <div className="text-red-500 text-sm">
            Error: {error.message}
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
};