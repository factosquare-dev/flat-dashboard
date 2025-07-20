import React from 'react';
import type { DragTooltip as DragTooltipType } from '../../../types/schedule';

interface DragTooltipProps {
  tooltip: DragTooltipType;
}

const DragTooltip: React.FC<DragTooltipProps> = ({ tooltip }) => {
  return (
    <div
      className="fixed bg-gray-900/95 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm pointer-events-none z-50 shadow-xl border border-gray-700"
      style={{ left: tooltip.x + 20, top: tooltip.y - 40 }}
    >
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{tooltip.date}</span>
      </div>
    </div>
  );
};

export default DragTooltip;