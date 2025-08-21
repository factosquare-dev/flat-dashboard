// Unified coordinate calculation utilities for consistent grid positioning
import { formatDateISO } from '@/shared/utils/coreUtils';

export interface GridCoordinates {
  x: number;
  width: number;
  date: Date;
  dayIndex: number;
}

export interface GridConfig {
  days: Date[];
  cellWidth: number;
  scrollLeft?: number;
  containerRect?: DOMRect;
}

/**
 * Core coordinate calculator - ensures all components use identical logic
 */
export class GridCoordinateCalculator {
  private config: GridConfig;
  
  constructor(config: GridConfig) {
    this.config = config;
  }
  
  /**
   * Convert mouse X coordinate to grid date (used for drop operations)
   */
  mouseXToDate(mouseX: number, includeScroll = true): Date {
    const { days, cellWidth, scrollLeft = 0, containerRect } = this.config;
    
    // Calculate grid-relative X coordinate
    let gridX = mouseX;
    if (containerRect) {
      gridX = mouseX - containerRect.left;
    }
    if (includeScroll) {
      gridX += scrollLeft;
    }
    
    // Guard against division by zero
    const safeCellWidth = cellWidth || 1;
    const daysFromStart = Math.floor(gridX / safeCellWidth);
    const clampedDays = Math.max(0, Math.min(daysFromStart, days.length - 1));
    
    // Mouse position to date calculation
    
    return new Date(days[clampedDays] || days[0]);
  }
  
  /**
   * Convert date to pixel position (used for positioning tasks and previews)
   */
  dateToPixel(date: Date): number {
    const { days, cellWidth } = this.config;
    const firstDay = days[0];
    const daysFromStart = Math.floor((date.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysFromStart * cellWidth;
  }
  
  /**
   * Calculate task position for rendering (handles scrolling)
   */
  calculateTaskPosition(startDate: Date, endDate: Date, forPreview = false): GridCoordinates {
    const { cellWidth, scrollLeft = 0 } = this.config;
    
    const left = this.dateToPixel(startDate);
    const right = this.dateToPixel(endDate);
    const width = Math.max(cellWidth, right - left + cellWidth);
    
    // For previews, adjust for scroll; for tasks, use absolute positioning
    const x = forPreview ? left - scrollLeft : left;
    
    const dayIndex = this.getDayIndex(startDate);
    
    // Debug logging removed
    
    return { x, width, date: startDate, dayIndex };
  }
  
  /**
   * Get day index for a date
   */
  getDayIndex(date: Date): number {
    const { days } = this.config;
    const targetTime = date.getTime();
    
    return days.findIndex(day => {
      const dayTime = day.getTime();
      const nextDayTime = dayTime + (24 * 60 * 60 * 1000);
      return targetTime >= dayTime && targetTime < nextDayTime;
    });
  }
  
  /**
   * Snap X coordinate to grid
   */
  snapToGrid(x: number, mode: 'start' | 'center' | 'end' = 'start'): number {
    const { cellWidth } = this.config;
    const safeCellWidth = cellWidth || 1; // Guard against division by zero
    const cellIndex = Math.floor(x / safeCellWidth);
    
    switch (mode) {
      case 'center':
        return cellIndex * safeCellWidth + safeCellWidth / 2;
      case 'end':
        return (cellIndex + 1) * safeCellWidth;
      default:
        return cellIndex * safeCellWidth;
    }
  }
}

// Utility functions for date calculations
export const calculateDateFromX = (x: number, cellWidth: number, days: Date[]): Date => {
  const calculator = new GridCoordinateCalculator({ days, cellWidth });
  return calculator.mouseXToDate(x, false);
};

export const calculateTaskDuration = (startDate: string | Date, endDate: string | Date): number => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

export const calculateEndDate = (startDate: Date, duration: number): Date => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + duration - 1); // -1 because duration includes start day
  return endDate;
};