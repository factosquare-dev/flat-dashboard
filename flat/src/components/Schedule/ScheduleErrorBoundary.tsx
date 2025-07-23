import React from 'react';
import ErrorBoundary from '../ErrorBoundary';

interface ScheduleErrorBoundaryProps {
  children: React.ReactNode;
}

const ScheduleErrorBoundary: React.FC<ScheduleErrorBoundaryProps> = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              스케줄 로딩 중 오류 발생
            </h2>
            <p className="text-gray-600 mb-6">
              스케줄을 불러오는 중 문제가 발생했습니다. 
              잠시 후 다시 시도해주세요.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};

export default ScheduleErrorBoundary;