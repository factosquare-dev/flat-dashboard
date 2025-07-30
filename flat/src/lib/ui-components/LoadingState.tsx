import React from 'react';
import { ComponentSize } from '../types/enums';
import './LoadingState.css';

interface LoadingStateProps {
  size?: ComponentSize;
  message?: string;
  fullscreen?: boolean;
  className?: string;
}

/**
 * Loading State Component
 * 
 * Follows SOLID-FLAT principles:
 * - Single Responsibility: Only displays loading state
 * - Open/Closed: Extensible via props
 * - The Rule of Three: This pattern was repeated across many components
 */
const LoadingState: React.FC<LoadingStateProps> = ({
  size = ComponentSize.MD,
  message,
  fullscreen = false,
  className = ''
}) => {
  const containerClasses = [
    'loading-state',
    `loading-state--${size.toLowerCase()}`,
    fullscreen ? 'loading-state--fullscreen' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <div className="loading-state__spinner">
        <svg
          className="loading-state__spinner-svg"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="loading-state__spinner-circle"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
      </div>
      {message && (
        <p className="loading-state__message">{message}</p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingState;