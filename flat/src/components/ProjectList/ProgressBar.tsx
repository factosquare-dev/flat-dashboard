import React from 'react';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="relative w-full max-w-[100px]">
      <div className="relative bg-gray-100 rounded-full h-6 overflow-hidden shadow-inner">
        <div 
          className="relative bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-700 ease-out shadow-sm"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white opacity-10" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-gray-700 drop-shadow-sm">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;