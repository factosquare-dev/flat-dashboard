import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

// 기본 ErrorFallback (기존 ErrorFallback.tsx 내용 기반)
export const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full space-y-8 p-8">
      <div className="rounded-md bg-red-50 p-4 border border-red-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Something went wrong</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>An unexpected error occurred. Please try refreshing the page.</p>
            </div>
          </div>
        </div>
      </div>
      
      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-4 p-4 bg-gray-100 rounded-lg">
          <summary className="cursor-pointer font-medium">
            Error Details
          </summary>
          <pre className="mt-2 text-xs overflow-auto">
            {error.toString()}
          </pre>
        </details>
      )}
      
      <div className="flex space-x-4">
        <button
          onClick={resetError}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          <Home className="w-4 h-4" />
          Go Home
        </button>
      </div>
    </div>
  </div>
);

// 프로젝트 목록용 ErrorFallback
export const ProjectListErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => (
  <div className="min-h-[400px] flex items-center justify-center p-8">
    <div className="text-center max-w-md">
      <div className="mb-4 flex justify-center">
        <div className="p-3 bg-red-100 rounded-full">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        프로젝트 목록을 불러올 수 없습니다
      </h2>
      <p className="text-gray-600 mb-4">
        일시적인 오류가 발생했습니다.
        {error?.message && (
          <span className="block text-sm text-gray-500 mt-2">
            오류: {error.message}
          </span>
        )}
      </p>
      <button
        onClick={() => {
          resetError();
          window.location.reload();
        }}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        새로고침
      </button>
    </div>
  </div>
);

// 스케줄용 ErrorFallback
export const ScheduleErrorFallback: React.FC<ErrorFallbackProps> = ({ resetError }) => (
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
        onClick={() => {
          resetError();
          window.location.reload();
        }}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        다시 시도
      </button>
    </div>
  </div>
);

// 컴포넌트용 경량 ErrorFallback
export const ComponentErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => (
  <div className="flex items-center justify-center p-4 border border-red-200 bg-red-50 rounded-lg">
    <div className="text-center">
      <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
      <p className="text-sm text-red-800 mb-2">컴포넌트 로딩 오류</p>
      <button
        onClick={resetError}
        className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        다시 시도
      </button>
    </div>
  </div>
);