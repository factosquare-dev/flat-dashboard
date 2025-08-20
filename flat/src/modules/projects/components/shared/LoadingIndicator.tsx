import React from 'react';

interface LoadingIndicatorProps {
  isLoading: boolean;
  message?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  isLoading, 
  message = 'Loading more projects...' 
}) => {
  if (!isLoading) return null;

  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      <span className="ml-2 text-gray-600">{message}</span>
    </div>
  );
};

export default LoadingIndicator;