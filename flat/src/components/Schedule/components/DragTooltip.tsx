import React from 'react';
import type { DragTooltip as DragTooltipType } from '@/types/schedule';

interface DragTooltipProps {
  tooltip: DragTooltipType;
}

const DragTooltip: React.FC<DragTooltipProps> = ({ tooltip }) => {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900/95 backdrop-blur-sm text-white px-4 py-3 rounded-lg text-sm z-50 shadow-xl border border-gray-700">
      <div className="flex items-center space-x-3">
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <div className="flex items-center space-x-2">
          <span className="font-medium">{tooltip.date}</span>
        </div>
      </div>
    </div>
  );
};

export default DragTooltip;