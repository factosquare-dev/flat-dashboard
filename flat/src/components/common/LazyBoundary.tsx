import React, { Suspense } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';

interface LazyBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

/**
 * Lazy Loading과 Error Boundary를 결합한 컴포넌트
 * 모든 lazy loaded 컴포넌트를 감싸서 사용
 */
export const LazyBoundary: React.FC<LazyBoundaryProps> = ({
  children,
  fallback = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 shadow-lg">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
        <p className="text-gray-600 mt-2">Loading...</p>
      </div>
    </div>
  ),
  errorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-md">
        <h3 className="text-red-600 font-semibold mb-2">컴포넌트 로딩 실패</h3>
        <p className="text-gray-600">페이지를 새로고침해주세요.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          새로고침
        </button>
      </div>
    </div>
  )
}) => {
  return (
    <ErrorBoundary
      fallback={errorFallback}
      onError={(error, errorInfo) => {
        console.error('Lazy loading error:', error, errorInfo);
      }}
    >
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyBoundary;