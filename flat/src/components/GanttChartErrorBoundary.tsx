import React from 'react';
import ErrorBoundary from './ErrorBoundary';

interface GanttChartErrorBoundaryProps {
  children: React.ReactNode;
}

const GanttChartErrorBoundary: React.FC<GanttChartErrorBoundaryProps> = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              간트 차트 렌더링 오류
            </h2>
            <p className="text-gray-600 mb-6">
              간트 차트를 표시하는 중 문제가 발생했습니다. 
              데이터를 확인하고 다시 시도해주세요.
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

export default GanttChartErrorBoundary;