import React, { useCallback } from 'react';
import { formatErrorForDisplay } from '../../utils/error/errorHandler';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  const formattedError = formatErrorForDisplay(error);
  
  const handleHomeClick = useCallback(() => {
    window.location.href = '/';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h2 className="mt-4 text-lg font-semibold text-gray-900 text-center">
          {formattedError.title}
        </h2>
        
        <p className="mt-2 text-sm text-gray-600 text-center">
          {formattedError.message}
        </p>
        
        {formattedError.code && (
          <p className="mt-2 text-xs text-gray-500 text-center">
            오류 코드: {formattedError.code}
          </p>
        )}
        
        <div className="mt-6 flex flex-col gap-3">
          {formattedError.retryable && (
            <button
              onClick={resetError}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              다시 시도
            </button>
          )}
          
          <button
            onClick={handleHomeClick}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  );
};