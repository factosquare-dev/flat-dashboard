/**
 * GanttChart Grid component - displays grid cells and handles positioning
 */

import React, { useMemo, useCallback } from 'react';
import type { DragState } from './types';
import { GANTT_CONSTANTS, totalDays, baseDate } from './constants';

interface GanttGridProps {
  totalRows: number;
  dragState: DragState;
}

const GanttGrid: React.FC<GanttGridProps> = ({ totalRows, dragState }) => {
  // Get today's column index for highlighting
  const todayIndex = useMemo(() => {
    const today = new Date();
    const diffTime = today.getTime() - baseDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays < totalDays ? diffDays : -1;
  }, []);

  // Helper function to get grid cell class names
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
    for (let col = 0; col < totalDays; col++) {
      if ((col + 1) % 7 === 0 || (col + 2) % 7 === 0) {
        weekendColumns.add(col);
      }
    }
    
    for (let row = 0; row < totalRows; row++) {
      for (let col = 0; col < totalDays; col++) {
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
            data-row={row}
            data-col={col}
          />
        );
      }
    }
    
    return cells;
  }, [totalRows, todayIndex, dragState.hoveredCell, dragState.isDragging, getGridCellClassName]);

  // Today line
  const todayLine = useMemo(() => {
    if (todayIndex === -1) return null;
    
    const linePosition = todayIndex * GANTT_CONSTANTS.CELL_WIDTH + GANTT_CONSTANTS.CELL_WIDTH / 2;
    
    return (
      <div
        className="absolute top-0 w-0.5 bg-red-500 z-20 pointer-events-none"
        style={{
          left: linePosition,
          height: totalRows * GANTT_CONSTANTS.CELL_HEIGHT
        }}
      />
    );
  }, [todayIndex, totalRows]);

  return (
    <div className="relative">
      {gridCells}
      {todayLine}
    </div>
  );
};

export default GanttGrid;