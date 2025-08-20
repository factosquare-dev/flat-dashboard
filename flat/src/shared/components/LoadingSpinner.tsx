import React from 'react';
import { cn } from '@/shared/utils/cn';
import { Size } from '@/shared/types/enums';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: Size;
  className?: string;
  color?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = Size.MD,
  className,
  color = 'currentColor',
  label = 'Loading...'
}) => {
  const sizeClassMap = {
    [Size.XS]: 'loading-spinner__svg--xs',
    [Size.SM]: 'loading-spinner__svg--sm',
    [Size.MD]: 'loading-spinner__svg--md',
    [Size.LG]: 'loading-spinner__svg--lg',
    [Size.XL]: 'loading-spinner__svg--xl'
  };

  return (
    <div className={cn('loading-spinner', className)} role="status">
      <svg
        className={cn('loading-spinner__svg', sizeClassMap[size])}
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
  spinnerSize = Size.LG,
  blur = true,
  message
}) => {
  return (
    <div className={cn('loading-overlay', className)}>
      {children}
      {isLoading && (
        <div className="loading-overlay__backdrop">
          {blur && (
            <div className="loading-overlay__backdrop loading-overlay__backdrop--blur" />
          )}
          <div className="loading-overlay__content">
            <LoadingSpinner size={spinnerSize} color="#3B82F6" />
            {message && (
              <p className="loading-overlay__message">{message}</p>
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
    <div className={cn('loading-dots', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'loading-dots__dot',
            dotClassName
          )}
        />
      ))}
    </div>
  );
};

interface LoadingFullScreenProps {
  text?: string;
  size?: Size;
}

export const LoadingFullScreen: React.FC<LoadingFullScreenProps> = ({
  text,
  size = Size.LG
}) => {
  return (
    <div className="loading-fullscreen">
      <div className="loading-fullscreen__content">
        <LoadingSpinner size={size} color="#3B82F6" />
        {text && <p className="loading-fullscreen__text">{text}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;