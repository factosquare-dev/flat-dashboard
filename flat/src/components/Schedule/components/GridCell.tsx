import React from 'react';
import { isWeekend, isToday, formatDateISO } from '../../../utils/coreUtils';
import { getCellBackgroundClasses, getCellHoverClasses, gridColors } from '../../../design-system/colors/grid';

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
        className={getCellBackgroundClasses(isTodayCell, isWeekendDay, true)}
        style={{ width: `${cellWidth}px` }}
      />
    );
  }

  return (
    <div
      className={`cursor-pointer transition-colors relative border-r ${gridColors.border.cell} ${
        getCellBackgroundClasses(isTodayCell, isWeekendDay)
      } ${getCellHoverClasses(isTodayCell, isWeekendDay)}`}
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