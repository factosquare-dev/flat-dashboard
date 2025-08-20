import React from 'react';
import type { Task } from '@/types/schedule';
import { GridCoordinateCalculator } from '@/utils/schedule/dragCalculations';

interface DragPreviewProps {
  startDate: string;
  endDate: string;
  draggedTask: Task | null;
  days: Date[];
  cellWidth: number;
  scrollLeft?: number;
}

const DragPreview: React.FC<DragPreviewProps> = ({
  startDate,
  endDate,
  draggedTask,
  days,
  cellWidth,
  scrollLeft = 0
}) => {
  if (!draggedTask) {
    return null;
  }

  // Calculate horizontal position using unified coordinate calculator
  const calculator = new GridCoordinateCalculator({
    days,
    cellWidth,
    scrollLeft
  });
  
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  const position = calculator.calculateTaskPosition(startDateObj, endDateObj, true); // Use true for preview positioning with scroll adjustment


  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${position.x}px`,
        width: `${position.width}px`,
        minWidth: `${cellWidth}px`,
        top: '0px',
        height: '30px',
        zIndex: 999, // Very high to be visible above everything
        transform: 'translate3d(0, 0, 0)',
        transition: 'none'
      }}
    >
      {/* Perfect dashed border preview */}
      <div 
        className="relative h-full rounded-md border-2 border-dashed border-blue-500"
        style={{
          backgroundColor: 'rgba(59, 130, 246, 0.15)', // 매우 연한 파란색 배경
          backdropFilter: 'blur(0.5px)',
          borderStyle: 'dashed',
          borderWidth: '2px',
          borderColor: '#3B82F6',
          borderRadius: '6px'
        }}
      >
        <div className="relative h-full px-2 flex items-center">
          <span className="text-xs font-medium truncate" style={{ color: '#1E40AF' }}>
            {draggedTask.title || draggedTask.taskType || 'Moving...'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DragPreview;