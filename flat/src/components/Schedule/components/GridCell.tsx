import React from 'react';
import { isWeekend, isToday, formatDateISO } from '../../../utils/coreUtils';
import { getCellBackgroundClasses, getCellHoverClasses, gridColors } from '../../../design-system/colors/grid';
import { cn } from '../../../utils/cn';
import './GridCell.css';

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
        className={cn(
          'grid-cell',
          'grid-cell--add-factory',
          getCellBackgroundClasses(isTodayCell, isWeekendDay, true)
        )}
        style={{ '--cell-width': `${cellWidth}px` } as React.CSSProperties}
      />
    );
  }

  return (
    <div
      className={cn(
        'grid-cell',
        'grid-cell--interactive',
        getCellBackgroundClasses(isTodayCell, isWeekendDay),
        getCellHoverClasses(isTodayCell, isWeekendDay)
      )}
      style={{ '--cell-width': `${cellWidth}px` } as React.CSSProperties}
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