import { GridCoordinateCalculator } from '../../utils/dragCalculations';
import { formatDateISO } from '../../../../utils/dateUtils';

// Resize-specific date calculation with snap zones
export const calculateResizeDateFromX = (
  x: number, 
  cellWidth: number, 
  days: Date[], 
  isEndDate: boolean = false
): Date => {
  // Create calculator for resize operations
  const calculator = new GridCoordinateCalculator({ days, cellWidth });
  
  // Use snap zones for better UX during resize
  const safeCellWidth = cellWidth || 1; // Guard against division by zero
  const cellIndex = Math.floor(x / safeCellWidth);
  const cellOffset = x % safeCellWidth;
  const snapThreshold = safeCellWidth * 0.5;
  
  if (isEndDate) {
    // For end dates, snap to cell end boundaries
    const targetIndex = cellOffset < snapThreshold 
      ? Math.max(0, cellIndex - 1)  // Snap to end of previous day
      : Math.min(cellIndex, days.length - 1); // Snap to end of current day
    
    // Bounds check
    if (targetIndex < 0 || targetIndex >= days.length) {
      return new Date(days[Math.max(0, Math.min(days.length - 1, targetIndex))]);
    }
    
    return new Date(days[targetIndex]);
  } else {
    // For start dates, snap to cell start boundaries  
    const targetIndex = cellOffset < snapThreshold
      ? cellIndex  // Snap to start of current day
      : Math.min(cellIndex + 1, days.length - 1); // Snap to start of next day
    
    // Bounds check
    if (targetIndex < 0 || targetIndex >= days.length) {
      return new Date(days[Math.max(0, Math.min(days.length - 1, targetIndex))]);
    }
    
    return new Date(days[targetIndex]);
  }
};

export const calculateHoveredDateIndex = (x: number, cellWidth: number, days: Date[]): number => {
  const isEndDate = false; // For hover, we use start date logic
  const newDate = calculateResizeDateFromX(x, cellWidth, days, isEndDate);
  const dateStr = formatDateISO(newDate);
  
  return days.findIndex(day => formatDateISO(day) === dateStr);
};

export const calculateSnapIndicatorX = (hoveredIndex: number, cellWidth: number, isEndDate: boolean): number => {
  return isEndDate ? (hoveredIndex + 1) * cellWidth : hoveredIndex * cellWidth;
};