/**
 * Gantt chart specific date utilities
 */

import { TaskStatus } from '@/shared/types/enums';
import { ProjectStatus } from '@/shared/types/project';
import { parseDate } from './parsing';
import { startOfDay, endOfDay, isToday, isSameDay } from './operations';

/**
 * Get task status based on date
 */
export function getTaskStatusByDate(
  plannedStartDate: string,
  plannedEndDate: string,
  currentDate: Date = new Date()
): TaskStatus {
  const startDate = parseDate(plannedStartDate);
  const endDate = parseDate(plannedEndDate);
  const today = startOfDay(currentDate, false);
  
  // If today is past the end date, task is overdue
  if (today > endOfDay(endDate, false)) {
    return TaskStatus.OVERDUE;
  }
  
  // If today is between start and end date, task is in progress
  if (today >= startOfDay(startDate, false) && today <= endOfDay(endDate, false)) {
    return TaskStatus.IN_PROGRESS;
  }
  
  // If start date is in the future, task is not started
  if (today < startOfDay(startDate, false)) {
    return TaskStatus.NOT_STARTED;
  }
  
  return TaskStatus.NOT_STARTED;
}

/**
 * Calculate the X position of a resize handle based on the date
 */
export function calculateResizeDateFromX(
  x: number,
  projectStartDate: Date,
  dayWidth: number,
  snapToDate: boolean = false
): Date {
  const daysFromStart = Math.floor(x / dayWidth);
  const result = new Date(projectStartDate);
  result.setDate(result.getDate() + daysFromStart);
  
  if (snapToDate) {
    return startOfDay(result, false);
  }
  
  return result;
}

/**
 * Calculate the index of the hovered date in the date range
 */
export function calculateHoveredDateIndex(
  x: number,
  dayWidth: number,
  totalDays: number
): number | null {
  const index = Math.floor(x / dayWidth);
  if (index >= 0 && index < totalDays) {
    return index;
  }
  return null;
}

/**
 * Calculate the X position for a snap indicator
 */
export function calculateSnapIndicatorX(
  dateIndex: number,
  dayWidth: number
): number {
  return dateIndex * dayWidth + dayWidth / 2;
}