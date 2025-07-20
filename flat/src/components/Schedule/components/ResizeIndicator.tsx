import React from 'react';

interface ResizeIndicatorProps {
  x: number;
  height: number;
  isEndResize: boolean;
}

const ResizeIndicator: React.FC<ResizeIndicatorProps> = ({ x, height, isEndResize }) => {
  return (
    <div
      className="absolute top-0 pointer-events-none z-40"
      style={{
        left: `${x}px`,
        height: `${height}px`,
        transform: isEndResize ? 'translateX(-2px)' : 'translateX(0)'
      }}
    >
      <div className="relative h-full">
        {/* Vertical line */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-blue-500" />
        
        {/* Top and bottom indicators */}
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full" />
        
      </div>
    </div>
  );
};

export default ResizeIndicator;