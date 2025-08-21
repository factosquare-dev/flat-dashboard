/**
 * Date validation utilities
 */

import { isValid } from 'date-fns';
import { parseDate } from './parsing';

/**
 * Check if string is a valid date
 */
export function isValidDateString(date: string): boolean {
  try {
    const parsed = parseDate(date);
    return isValid(parsed);
  } catch {
    return false;
  }
}

/**
 * Validate date range
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  if (!isValidDateString(startDate) || !isValidDateString(endDate)) {
    return false;
  }
  
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  return start <= end;
}