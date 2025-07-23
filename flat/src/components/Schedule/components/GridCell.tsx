import React from 'react';
import { isWeekend, isToday, formatDateISO } from '../../../utils/dateUtils';

interface GridCellProps {
  day: Date;
  cellWidth: number;
  projectId: string;
  isAddFactoryRow: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

const GridCell: React.FC<GridCellProps> = ({
  day,
  cellWidth,
  projectId,
  isAddFactoryRow,
  onClick,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  const isWeekendDay = isWeekend(day);
  const isTodayCell = isToday(day);
  
  if (isAddFactoryRow) {
    return (
      <div
        className={`${
          isTodayCell ? 'bg-blue-100/20' : isWeekendDay ? 'bg-gray-100/50' : ''
        }`}
        style={{ width: `${cellWidth}px` }}
      />
    );
  }

  return (
    <div
      className={`cursor-pointer transition-colors relative border-r border-gray-100 ${
        isTodayCell 
          ? 'bg-blue-50/30 hover:bg-blue-100/40' 
          : isWeekendDay 
          ? 'bg-gray-50/80 hover:bg-gray-100' 
          : 'bg-white/50 hover:bg-blue-50/30'
      }`}
      style={{ 
        width: `${cellWidth}px`, 
        height: '100%'
      }}
      onClick={onClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      data-date={formatDateISO(day)}
      data-project-id={projectId}
    />
  );
};

export default GridCell;