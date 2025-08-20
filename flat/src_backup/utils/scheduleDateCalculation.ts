/**
 * Date-based calculation utilities for Schedule component
 * Uses date-fns for accurate date handling
 */

import { format, differenceInDays } from 'date-fns';
import type { Task } from '@/types/schedule';
import { parseScheduleDate } from './scheduleDateParsing';

/**
 * Format date to YYYY-MM-DD for consistent comparison
 */
export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Find the index of a date in the days array
 */
export function findDateIndex(targetDate: string, days: Date[]): number {
  const targetKey = formatDateKey(parseScheduleDate(targetDate));
  const index = days.findIndex(day => formatDateKey(day) === targetKey);
  
  return index;
}

/**
 * Calculate task position based on date matching
 * @param taskStartDate - Task start date string (YYYY-MM-DD)
 * @param taskEndDate - Task end date string (YYYY-MM-DD)
 * @param days - Array of dates in the grid
 * @param cellWidth - Width of each day cell
 * @returns Object with x position and width
 */
export function calculateTaskPositionByDate(
  taskStartDate: string,
  taskEndDate: string,
  days: Date[],
  cellWidth: number
): { x: number; width: number; startIndex: number; duration: number } {
  // Parse dates
  const startDate = parseScheduleDate(taskStartDate);
  const endDate = parseScheduleDate(taskEndDate);
  
  // Find the index of the start date
  const startIndex = findDateIndex(taskStartDate, days);
  
  // If start date is before grid start, adjust to first day
  let adjustedStartIndex = startIndex;
  if (startIndex === -1) {
    // Check if task starts before grid
    if (startDate < days[0]) {
      adjustedStartIndex = 0;
    } else {
      // Task starts after grid ends - should not be displayed
      return { x: -cellWidth, width: 0, startIndex: -1, duration: 0 };
    }
  }
  
  // Calculate duration in days (inclusive)
  const duration = differenceInDays(endDate, startDate) + 1;
  
  // Calculate position
  const x = adjustedStartIndex * cellWidth;
  const width = Math.max(cellWidth, duration * cellWidth);
  
  const result = { 
    x, 
    width, 
    startIndex: adjustedStartIndex, 
    duration 
  };
  
  
  return result;
}

/**
 * Create a map of date to index for faster lookups
 */
export function createDateIndexMap(days: Date[]): Map<string, number> {
  const map = new Map<string, number>();
  days.forEach((day, index) => {
    map.set(formatDateKey(day), index);
  });
  return map;
}

/**
 * Calculate task positions for multiple tasks efficiently
 */
export function calculateMultipleTaskPositions(
  tasks: Task[],
  days: Date[],
  cellWidth: number
): Task[] {
  // Create date index map for efficiency
  const dateIndexMap = createDateIndexMap(days);
  
  return tasks.map(task => {
    const position = calculateTaskPositionByDate(
      task.startDate,
      task.endDate,
      days,
      cellWidth
    );
    
    return {
      ...task,
      x: position.x,
      width: position.width
    };
  });
}

/**
 * Validate task dates against grid range
 */
export function validateTaskDates(
  task: Task,
  gridStartDate: Date,
  gridEndDate: Date
): { isValid: boolean; error?: string } {
  const taskStart = parseScheduleDate(task.startDate);
  const taskEnd = parseScheduleDate(task.endDate);
  
  if (taskStart > taskEnd) {
    return { isValid: false, error: 'Task start date is after end date' };
  }
  
  if (taskEnd < gridStartDate) {
    return { isValid: false, error: 'Task ends before grid starts' };
  }
  
  if (taskStart > gridEndDate) {
    return { isValid: false, error: 'Task starts after grid ends' };
  }
  
  return { isValid: true };
}

