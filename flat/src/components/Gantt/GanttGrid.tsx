import React, { useMemo, useCallback } from 'react';
import type { DragState } from '../../types/gantt';
import { GANTT_CONSTANTS, TOTAL_DAYS } from '../../constants/gantt';
import { getTodayIndex, isTodayInRange, isWeekendColumn } from '../../utils/ganttUtils';

interface GanttGridProps {
  totalRows: number;
  dragState: DragState;
}

const GanttGrid: React.FC<GanttGridProps> = ({ totalRows, dragState }) => {
  const todayIndex = getTodayIndex();
  const isToday = isTodayInRange();

  // Helper function to get grid cell class names - cleaner than inline ternary operators
  const getGridCellClassName = useCallback((isWeekend: boolean, isTodayColumn: boolean, isHovered: boolean) => {
    const baseClasses = 'absolute border-r border-b border-gray-200 transition-colors';
    const backgroundClass = isWeekend ? 'bg-gray-50' : 'bg-white';
    const todayClass = isTodayColumn ? 'bg-red-50' : '';
    const hoverClass = isHovered && dragState.isDragging ? 'bg-blue-100 border-blue-400' : '';
    
    return `${baseClasses} ${backgroundClass} ${todayClass} ${hoverClass}`.trim();
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
              left: col * GANTT_CONSTANTS.CELL_WIDTH,
              top: row * GANTT_CONSTANTS.CELL_HEIGHT,
              width: GANTT_CONSTANTS.CELL_WIDTH,
              height: GANTT_CONSTANTS.CELL_HEIGHT
            }}
          />
        );
      }
    }
    
    return cells;
  }, [totalRows, todayIndex, dragState.hoveredCell, dragState.isDragging, getGridCellClassName]);

  return (
    <>
      {/* Grid cells */}
      {gridCells}
      
      {/* Today line */}
      {isToday && (
        <div
          className="absolute top-0 w-0.5 bg-red-500 z-10"
          style={{ 
            left: todayIndex * GANTT_CONSTANTS.CELL_WIDTH + GANTT_CONSTANTS.CELL_WIDTH / 2,
            height: totalRows * GANTT_CONSTANTS.CELL_HEIGHT
          }}
        >
          <div className="absolute -top-6 -left-8 bg-red-500 text-white text-xs px-2 py-1 rounded">
            오늘
          </div>
        </div>
      )}
    </>
  );
};

export default GanttGrid;