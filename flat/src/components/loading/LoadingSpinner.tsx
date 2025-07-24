import React from 'react';
import { cn } from '../../utils/cn';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  color = 'currentColor',
  label = 'Loading...'
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={cn('inline-flex items-center', className)} role="status">
      <svg
        className={cn(sizeClasses[size], 'animate-spin')}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill={color}
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  spinnerSize?: LoadingSpinnerProps['size'];
  blur?: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  className,
  spinnerSize = 'lg',
  blur = true,
  message
}) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          {blur && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm" />
          )}
          <div className="relative flex flex-col items-center gap-3">
            <LoadingSpinner size={spinnerSize} color="#3B82F6" />
            {message && (
              <p className="text-sm font-medium text-gray-600">{message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface LoadingDotsProps {
  className?: string;
  dotClassName?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ 
  className, 
  dotClassName 
}) => {
  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'w-2 h-2 bg-gray-400 rounded-full animate-bounce',
            dotClassName
          )}
          style={{
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;