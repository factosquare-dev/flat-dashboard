import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  progress: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className = '' }) => {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  return (
    <div className={`progress-bar ${className}`}>
      <div className="progress-bar__track">
        <div 
          className="progress-bar__fill"
          style={{ '--progress-width': `${clampedProgress}%` } as React.CSSProperties}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <div className="progress-bar__label">
        {clampedProgress}%
      </div>
    </div>
  );
};

export default ProgressBar;