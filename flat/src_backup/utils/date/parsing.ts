/**
 * Date parsing utilities
 */

import { parseISO } from 'date-fns';

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