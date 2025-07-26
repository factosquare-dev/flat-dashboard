import React, { useMemo, useCallback } from 'react';
import type { DragState } from '../../types/gantt';
import { GANTT_CONSTANTS, TOTAL_DAYS } from '../../constants/gantt';
import { getTodayIndex, isTodayInRange, isWeekendColumn } from '../../utils/ganttUtils';
import { cn } from '../../utils/cn';
import './GanttGrid.css';

interface GanttGridProps {
  totalRows: number;
  dragState: DragState;
}

const GanttGrid: React.FC<GanttGridProps> = ({ totalRows, dragState }) => {
  const todayIndex = getTodayIndex();
  const isToday = isTodayInRange();

  // Helper function to get grid cell class names
  const getGridCellClassName = useCallback((isWeekend: boolean, isTodayColumn: boolean, isHovered: boolean) => {
    return cn(
      'gantt-grid__cell',
      isWeekend && 'gantt-grid__cell--weekend',
      isTodayColumn && 'gantt-grid__cell--today',
      isHovered && dragState.isDragging && 'gantt-grid__cell--hovered'
    );
  }, [dragState.isDragging]);

  // Render grid cells - memoized for performance
  const gridCells = useMemo(() => {
    const cells = [];
    
    // Pre-calculate weekend columns for better performance
    const weekendColumns = new Set();
    for (let col = 0; col < TOTAL_DAYS; col++) {
      if (isWeekendColumn(col)) {
        weekendColumns.add(col);
      }
    }
    
    for (let row = 0; row < totalRows; row++) {
      for (let col = 0; col < TOTAL_DAYS; col++) {
        const isWeekend = weekendColumns.has(col);
        const isTodayColumn = col === todayIndex;
        const isHovered = dragState.hoveredCell?.row === row && dragState.hoveredCell?.col === col;
        
        cells.push(
          <div
            key={`${row}-${col}`}
            className={getGridCellClassName(isWeekend, isTodayColumn, isHovered)}
            style={{
              '--cell-col': col,
              '--cell-row': row,
              '--gantt-cell-width': `${GANTT_CONSTANTS.CELL_WIDTH}px`,
              '--gantt-cell-height': `${GANTT_CONSTANTS.CELL_HEIGHT}px`
            } as React.CSSProperties}
          />
        );
      }
    }
    
    return cells;
  }, [totalRows, todayIndex, dragState.hoveredCell, getGridCellClassName]);

  return (
    <>
      {/* Grid cells */}
      {gridCells}
      
      {/* Today line */}
      {isToday && (
        <div
          className="gantt-grid__today-line"
          style={{
            '--today-index': todayIndex,
            '--total-rows': totalRows,
            '--gantt-cell-width': `${GANTT_CONSTANTS.CELL_WIDTH}px`,
            '--gantt-cell-height': `${GANTT_CONSTANTS.CELL_HEIGHT}px`
          } as React.CSSProperties}
        >
          <div className="gantt-grid__today-label">
            오늘
          </div>
        </div>
      )}
    </>
  );
};

export default GanttGrid;