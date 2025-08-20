/**
 * Date operation utilities
 */

import { 
  startOfDay as dateFnsStartOfDay,
  endOfDay as dateFnsEndOfDay,
  addDays as dateFnsAddDays,
  subDays as dateFnsSubDays,
  differenceInDays,
  isAfter,
  isBefore,
  isEqual,
  eachDayOfInterval
} from 'date-fns';
import { parseDate } from './parsing';

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
 * Add days to a date
 */
export function addDays(date: Date | string, days: number, isUtc: boolean = true): Date {
  const d = typeof date === 'string' ? parseDate(date, isUtc) : date;
  return dateFnsAddDays(d, days);
}

/**
 * Subtract days from a date
 */
export function subDays(date: Date | string, days: number, isUtc: boolean = true): Date {
  const d = typeof date === 'string' ? parseDate(date, isUtc) : date;
  return dateFnsSubDays(d, days);
}

/**
 * Get number of days between two dates
 */
export function getDaysBetween(start: Date | string, end: Date | string, isUtc: boolean = true): number {
  const startDate = typeof start === 'string' ? parseDate(start, isUtc) : start;
  const endDate = typeof end === 'string' ? parseDate(end, isUtc) : end;
  return differenceInDays(endDate, startDate);
}

/**
 * Get array of dates between start and end (inclusive)
 */
export function getDaysArray(start: Date | string, end: Date | string, isUtc: boolean = true): Date[] {
  const startDate = typeof start === 'string' ? parseDate(start, isUtc) : start;
  const endDate = typeof end === 'string' ? parseDate(end, isUtc) : end;
  return eachDayOfInterval({ start: startDate, end: endDate });
}

/**
 * Check if date is in the past
 */
export function isPast(date: Date | string, isUtc: boolean = true): boolean {
  const d = typeof date === 'string' ? parseDate(date, isUtc) : date;
  return isBefore(d, new Date());
}

/**
 * Check if date is in the future
 */
export function isFuture(date: Date | string, isUtc: boolean = true): boolean {
  const d = typeof date === 'string' ? parseDate(date, isUtc) : date;
  return isAfter(d, new Date());
}

/**
 * Check if a date is within a range (inclusive)
 */
export function isDateInRange(
  date: Date | string,
  startDate: Date | string,
  endDate: Date | string,
  isUtc: boolean = true
): boolean {
  const d = typeof date === 'string' ? parseDate(date, isUtc) : date;
  const start = typeof startDate === 'string' ? parseDate(startDate, isUtc) : startDate;
  const end = typeof endDate === 'string' ? parseDate(endDate, isUtc) : endDate;
  
  return (isAfter(d, start) || isEqual(d, start)) && 
         (isBefore(d, end) || isEqual(d, end));
}

/**
 * Check if date is weekend
 */
export function isWeekend(date: Date | string, isUtc: boolean = true): boolean {
  const d = typeof date === 'string' ? parseDate(date, isUtc) : date;
  const day = d.getDay();
  return day === 0 || day === 6;
}

/**
 * Get week number of the year
 */
export function getWeekNumber(date: Date | string, isUtc: boolean = true): number {
  const d = typeof date === 'string' ? parseDate(date, isUtc) : date;
  const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
  const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * Get user timezone
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    // Fallback for older browsers
    const offset = new Date().getTimezoneOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset <= 0 ? '+' : '-';
    return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}

/**
 * Get timezone offset in minutes
 */
export function getTimezoneOffset(): number {
  return new Date().getTimezoneOffset();
}