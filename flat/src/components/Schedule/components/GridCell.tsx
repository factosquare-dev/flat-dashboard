import React from 'react';
import { isWeekend, isToday } from '../../../utils/dateUtils';

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
      className={`cursor-pointer transition-colors ${
        isTodayCell 
          ? 'bg-blue-100/20 hover:bg-blue-100/30' 
          : isWeekendDay 
          ? 'bg-gray-100/50 hover:bg-gray-100' 
          : 'hover:bg-blue-50/30'
      }`}
      style={{ width: `${cellWidth}px` }}
      onClick={onClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    />
  );
};

export default GridCell;