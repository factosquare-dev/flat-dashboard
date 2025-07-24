import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface SectionErrorBoundaryProps {
  children: React.ReactNode;
  sectionName?: string;
}

const SectionErrorFallback: React.FC<{ error: Error; resetError: () => void; sectionName?: string }> = ({ 
  error, 
  resetError,
  sectionName 
}) => {
  return (
    <div className="p-4 m-2 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-sm font-semibold text-red-800">
          {sectionName ? `${sectionName} 섹션 오류` : '섹션 오류'}
        </h3>
      </div>
      <p className="text-sm text-red-600 mb-3">{error.message}</p>
      <button
        onClick={resetError}
        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
      >
        다시 시도
      </button>
    </div>
  );
};

export const SectionErrorBoundary: React.FC<SectionErrorBoundaryProps> = ({ children, sectionName }) => {
  return (
    <ErrorBoundary 
      fallback={(props) => <SectionErrorFallback {...props} sectionName={sectionName} />}
    >
      {children}
    </ErrorBoundary>
  );
};