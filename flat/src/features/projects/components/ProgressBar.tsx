import React from 'react';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="relative w-full mx-auto">
      <div className="relative bg-gray-200/60 rounded-full h-2.5 overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 bg-[#0061FF] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-1 text-[11px] font-medium text-gray-700 text-center">
        {progress}%
      </div>
    </div>
  );
};

export default ProgressBar;