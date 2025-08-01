/**
 * Unified Date Utilities
 * Single source of truth for all date operations in the application
 * Handles UTC/Local timezone conversions consistently
 */

import { 
  startOfDay as dateFnsStartOfDay,
  endOfDay as dateFnsEndOfDay,
  parseISO,
  isValid,
  format,
  addDays as dateFnsAddDays,
  subDays as dateFnsSubDays,
  differenceInDays,
  isAfter,
  isBefore,
  isEqual,
  eachDayOfInterval
} from 'date-fns';
import { TaskStatus } from '../types/enums';
import { ProjectStatus } from '../types/project';

/**
 * Parse UTC date string to local Date object
 * This is the ONLY function that should handle UTC to local conversion
 */
export function parseUtcDate(dateString: string): Date {
  if (!dateString) {
    throw new Error('Invalid date string: empty or null');
  }

  // For date-only format (YYYY-MM-DD), assume it's UTC midnight
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(dateString + 'T00:00:00Z');
  }
  
  // For datetime without timezone indicator, assume UTC
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(dateString)) {
    return new Date(dateString + 'Z');
  }
  
  // For ISO strings without Z but with milliseconds, assume UTC
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}$/.test(dateString)) {
    return new Date(dateString + 'Z');
  }
  
  // Otherwise parse normally (handles Z, +00:00, -05:00, etc.)
  return new Date(dateString);
}

/**
 * Parse any date input (string, Date, or UTC string) to local Date
 */
export function parseDate(input: string | Date, isUtc: boolean = true): Date {
  if (input instanceof Date) {
    return input;
  }
  
  // Korean date format: "2025. 7. 5."
  if (input.includes('. ')) {
    const parts = input.replace(/\./g, '').trim().split(' ');
    if (parts.length >= 3) {
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      input = `${year}-${month}-${day}`;
    }
  }
  
  return isUtc ? parseUtcDate(input) : new Date(input);
}

/**
 * Get start of day in local timezone
 */
export function startOfDay(date: Date | string, isUtc: boolean = true): Date {
  const d = typeof date === 'string' ? parseDate(date, isUtc) : date;
  return dateFnsStartOfDay(d);
}

/**
 * Get end of day in local timezone
 */
export function endOfDay(date: Date | string, isUtc: boolean = true): Date {
  const d = typeof date === 'string' ? parseDate(date, isUtc) : date;
  return dateFnsEndOfDay(d);
}

/**
 * Get today at start of day in local timezone
 */
export function getToday(): Date {
  return startOfDay(new Date(), false);
}

/**
 * Check if date is today in local timezone
 */
export function isToday(date: Date | string, isUtc: boolean = true): boolean {
  const d = typeof date === 'string' ? parseDate(date, isUtc) : date;
  const today = getToday();
  
  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear();
}

/**
 * Check if two dates are the same day in local timezone
 */
export function isSameDay(date1: Date | string, date2: Date | string, isUtc: boolean = true): boolean {
  const d1 = typeof date1 === 'string' ? parseDate(date1, isUtc) : date1;
  const d2 = typeof date2 === 'string' ? parseDate(date2, isUtc) : date2;
  
  return d1.getDate() === d2.getDate() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getFullYear() === d2.getFullYear();
}

/**
 * Format date for display
 */
export function formatDate(
  date: Date | string,
  formatStr: string = 'yyyy-MM-dd',
  isUtc: boolean = true
): string {
  const d = typeof date === 'string' ? parseDate(date, isUtc) : date;
  return format(d, formatStr);
}

/**
 * Format date for locale-specific display
 */
export function formatDateLocale(
  date: Date | string,
  style: 'short' | 'long' | 'iso' = 'short',
  locale?: string,
  isUtc: boolean = true
): string {
  const d = typeof date === 'string' ? parseDate(date, isUtc) : date;
  const userLocale = locale || navigator.language || 'en-US';
  
  switch (style) {
    case 'short':
      return d.toLocaleDateString(userLocale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      
    case 'long':
      return d.toLocaleDateString(userLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
      
    case 'iso':
      return formatDate(d, 'yyyy-MM-dd', false);
      
    default:
      return d.toLocaleDateString(userLocale);
  }
}

/**
 * Convert local date to UTC string (YYYY-MM-DD)
 */
export function toUtcDateString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convert Date to local date string (YYYY-MM-DD)
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current date/time as ISO string
 */
export function getCurrentISOString(): string {
  return new Date().toISOString();
}

/**
 * Get task status based on date range
 * Assumes dates are in UTC format from backend
 */
export function getTaskStatusByDate(
  startDateStr: string,
  endDateStr: string,
  projectStatus: ProjectStatus
): TaskStatus {
  if (projectStatus === ProjectStatus.COMPLETED) return TaskStatus.COMPLETED;
  if (projectStatus === ProjectStatus.PLANNING) return TaskStatus.TODO;
  
  const startLocal = parseDate(startDateStr, false);
  const endLocal = parseDate(endDateStr, false);
  const today = getToday();
  
  if (endLocal < today) {
    return TaskStatus.COMPLETED;
  } else if (startLocal <= today && endLocal >= today) {
    return TaskStatus.IN_PROGRESS;
  } else {
    return TaskStatus.TODO;
  }
}

/**
 * Add days to date
 */
export function addDays(date: Date | string, days: number, isUtc: boolean = true): Date {
  const d = typeof date === 'string' ? parseDate(date, isUtc) : date;
  return dateFnsAddDays(d, days);
}

/**
 * Subtract days from date
 */
export function subDays(date: Date | string, days: number, isUtc: boolean = true): Date {
  const d = typeof date === 'string' ? parseDate(date, isUtc) : date;
  return dateFnsSubDays(d, days);
}

/**
 * Get days between two dates
 */
export function getDaysBetween(start: Date | string, end: Date | string, isUtc: boolean = true): number {
  const startDate = typeof start === 'string' ? parseDate(start, isUtc) : start;
  const endDate = typeof end === 'string' ? parseDate(end, isUtc) : end;
  return differenceInDays(endDate, startDate);
}

/**
 * Generate array of dates between start and end
 */
export function getDaysArray(start: Date | string, end: Date | string, isUtc: boolean = true): Date[] {
  const startDate = startOfDay(start, isUtc);
  const endDate = startOfDay(end, isUtc);
  return eachDayOfInterval({ start: startDate, end: endDate });
}

/**
 * Check if date is in the past
 */
export function isPast(date: Date | string, isUtc: boolean = true): boolean {
  const d = typeof date === 'string' ? parseDate(date, isUtc) : date;
  return isBefore(startOfDay(d, false), getToday());
}

/**
 * Check if date is in the future
 */
export function isFuture(date: Date | string, isUtc: boolean = true): boolean {
  const d = typeof date === 'string' ? parseDate(date, isUtc) : date;
  return isAfter(startOfDay(d, false), getToday());
}

/**
 * Check if date is within range
 */
export function isDateInRange(
  date: Date | string,
  start: Date | string,
  end: Date | string,
  isUtc: boolean = true
): boolean {
  const d = startOfDay(date, isUtc);
  const startDate = startOfDay(start, isUtc);
  const endDate = startOfDay(end, isUtc);
  
  return (isAfter(d, startDate) || isEqual(d, startDate)) && 
         (isBefore(d, endDate) || isEqual(d, endDate));
}

/**
 * Get user's timezone
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

/**
 * Get timezone offset in hours
 */
export function getTimezoneOffset(): number {
  return -(new Date().getTimezoneOffset() / 60);
}

// Re-export commonly used date-fns functions for consistency
export { isValid, parseISO };

/**
 * Format relative time (e.g., "3분 전", "2시간 전")
 */
export function formatRelativeTime(date: Date | string, isUtc: boolean = true): string {
  const d = typeof date === 'string' ? parseDate(date, isUtc) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  
  return formatDateLocale(d, 'short', 'ko-KR', false);
}

/**
 * Check if date string is valid format (YYYY-MM-DD)
 */
export function isValidDateString(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const parsedDate = parseDate(date);
  return isValid(parsedDate);
}

/**
 * Check if date range is valid (start <= end)
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  if (!isValidDateString(startDate) || !isValidDateString(endDate)) {
    return false;
  }
  
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  return start <= end;
}

/**
 * Check if date is weekend
 */
export function isWeekend(date: Date | string, isUtc: boolean = true): boolean {
  const d = typeof date === 'string' ? parseDate(date, isUtc) : date;
  const day = d.getDay();
  return day === 0 || day === 6; // Sunday is 0, Saturday is 6
}

/**
 * Get week number of the year
 */
export function getWeekNumber(date: Date | string, isUtc: boolean = true): number {
  const d = typeof date === 'string' ? parseDate(date, isUtc) : date;
  const tempDate = new Date(d.valueOf());
  tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
  const week1 = new Date(tempDate.getFullYear(), 0, 4);
  return 1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

// ============================================================================
// GANTT/SCHEDULE SPECIFIC DATE CALCULATIONS
// ============================================================================

/**
 * Calculate date from X coordinate in Gantt chart
 */
export function calculateResizeDateFromX(
  x: number,
  containerLeft: number,
  cellWidth: number,
  days: Date[]
): Date {
  const relativeX = x - containerLeft;
  const dayIndex = Math.floor(relativeX / cellWidth);
  const clampedIndex = Math.max(0, Math.min(dayIndex, days.length - 1));
  return days[clampedIndex];
}

/**
 * Calculate hovered date index from X coordinate
 */
export function calculateHoveredDateIndex(
  x: number,
  containerLeft: number,
  cellWidth: number,
  daysCount: number
): number {
  const relativeX = x - containerLeft;
  const index = Math.floor(relativeX / cellWidth);
  return Math.max(0, Math.min(index, daysCount - 1));
}

/**
 * Calculate snap indicator X position
 */
export function calculateSnapIndicatorX(
  dateIndex: number,
  cellWidth: number,
  isEnd: boolean = false
): number {
  // If it's the end position, add cellWidth to position at the end of the cell
  return dateIndex * cellWidth + (isEnd ? cellWidth : 0);
}