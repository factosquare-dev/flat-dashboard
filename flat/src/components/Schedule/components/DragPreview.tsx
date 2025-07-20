import React from 'react';
import type { Task } from '../../../types/schedule';

interface DragPreviewProps {
  projectId: string;
  startDate: string;
  endDate: string;
  draggedTask: Task | null;
  days: Date[];
  cellWidth: number;
}

const DragPreview: React.FC<DragPreviewProps> = ({
  projectId,
  startDate,
  endDate,
  draggedTask,
  days,
  cellWidth
}) => {
  const left = (new Date(startDate).getTime() - days[0].getTime()) / (1000 * 60 * 60 * 24) * cellWidth;
  const width = Math.max(cellWidth, ((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24) + 1) * cellWidth);

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${left}px`,
        width: `${width}px`,
        minWidth: `${cellWidth}px`,
        top: '15px',
        height: '30px'
      }}
    >
      <div className="relative h-full rounded-md overflow-hidden bg-blue-100/30 border-2 border-blue-400 border-dashed">
        <div className="relative h-full px-2 flex items-center">
          <span className="text-xs text-blue-700 font-medium truncate">
            {draggedTask?.title || '새 태스크'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DragPreview;