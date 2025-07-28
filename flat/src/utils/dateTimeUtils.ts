/**
 * DateTime utilities for handling timezone conversions
 * Ensures consistent date handling across UTC (backend) and local timezone (frontend)
 * Works automatically with user's browser timezone settings
 */

/**
 * Convert UTC date string to local date object
 * Handles both date-only (YYYY-MM-DD) and full ISO datetime strings
 * Automatically converts to user's local timezone
 */
export function utcToLocal(utcDateString: string): Date {
  if (!utcDateString) {
    throw new Error('Invalid date string: empty or null');
  }

  // For date-only format (YYYY-MM-DD), assume it's UTC midnight
  if (/^\d{4}-\d{2}-\d{2}$/.test(utcDateString)) {
    // Append UTC time to ensure it's parsed as UTC
    return new Date(utcDateString + 'T00:00:00Z');
  }
  
  // For datetime without timezone indicator, assume UTC
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(utcDateString)) {
    return new Date(utcDateString + 'Z');
  }
  
  // For ISO strings without Z but with milliseconds, assume UTC
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}$/.test(utcDateString)) {
    return new Date(utcDateString + 'Z');
  }
  
  // Otherwise parse normally (handles Z, +00:00, -05:00, etc.)
  return new Date(utcDateString);
}

/**
 * Convert local date to UTC string in YYYY-MM-DD format
 */
export function localToUtcDateString(localDate: Date): string {
  const year = localDate.getUTCFullYear();
  const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(localDate.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date at midnight in local timezone
 */
export function getTodayLocal(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Get today's date in UTC format (YYYY-MM-DD)
 * This represents "today" in the user's local timezone, converted to UTC
 */
export function getTodayUtcString(): string {
  const today = getTodayLocal();
  // Convert local midnight to UTC
  return today.toISOString().split('T')[0];
}

/**
 * Compare if a UTC date string represents "today" in local timezone
 */
export function isUtcDateToday(utcDateString: string): boolean {
  const utcDate = utcToLocal(utcDateString);
  const today = getTodayLocal();
  
  // Compare dates in local timezone
  return utcDate.getFullYear() === today.getFullYear() &&
         utcDate.getMonth() === today.getMonth() &&
         utcDate.getDate() === today.getDate();
}

/**
 * Compare if two dates are the same day in local timezone
 */
export function isSameLocalDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? utcToLocal(date1) : date1;
  const d2 = typeof date2 === 'string' ? utcToLocal(date2) : date2;
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

/**
 * Get the start of day in local timezone for a UTC date string
 */
export function getLocalStartOfDay(utcDateString: string): Date {
  const localDate = utcToLocal(utcDateString);
  localDate.setHours(0, 0, 0, 0);
  return localDate;
}

/**
 * Format UTC date string to local display format
 * Uses browser's locale settings for proper internationalization
 */
export function formatUtcToLocalDisplay(
  utcDateString: string, 
  format: 'short' | 'long' | 'iso' = 'short',
  locale?: string
): string {
  const localDate = utcToLocal(utcDateString);
  
  // Use browser's locale if not specified
  const userLocale = locale || navigator.language || 'en-US';
  
  switch (format) {
    case 'short':
      return localDate.toLocaleDateString(userLocale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      
    case 'long':
      return localDate.toLocaleDateString(userLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
      
    case 'iso':
      // Return ISO format in local timezone (YYYY-MM-DD)
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, '0');
      const day = String(localDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
      
    default:
      return localDate.toLocaleDateString(userLocale);
  }
}

/**
 * Get timezone offset in hours (e.g., 9 for KST, -5 for EST)
 */
export function getTimezoneOffset(): number {
  return -(new Date().getTimezoneOffset() / 60);
}

/**
 * Get user's timezone name (e.g., 'Asia/Seoul', 'America/New_York')
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    // Fallback for older browsers
    return 'UTC';
  }
}

/**
 * Format date with timezone information
 */
export function formatDateWithTimezone(
  date: Date | string,
  includeTime: boolean = false,
  locale?: string
): string {
  const d = typeof date === 'string' ? utcToLocal(date) : date;
  const userLocale = locale || navigator.language || 'en-US';
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZoneName: 'short'
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return d.toLocaleString(userLocale, options);
}

/**
 * Check if date is in the past (considering timezone)
 */
export function isPastDate(utcDateString: string): boolean {
  const localDate = utcToLocal(utcDateString);
  const today = getTodayLocal();
  return localDate < today;
}

/**
 * Check if date is in the future (considering timezone)
 */
export function isFutureDate(utcDateString: string): boolean {
  const localDate = utcToLocal(utcDateString);
  const today = getTodayLocal();
  today.setHours(23, 59, 59, 999); // End of today
  return localDate > today;
}

/**
 * Get days difference between two dates in local timezone
 */
export function getDaysDifference(date1: string | Date, date2: string | Date): number {
  const d1 = typeof date1 === 'string' ? utcToLocal(date1) : date1;
  const d2 = typeof date2 === 'string' ? utcToLocal(date2) : date2;
  
  // Normalize to start of day to ignore time differences
  const start1 = new Date(d1);
  start1.setHours(0, 0, 0, 0);
  const start2 = new Date(d2);
  start2.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(start2.getTime() - start1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Add days to a UTC date string and return UTC string
 */
export function addDaysToUtcDate(utcDateString: string, days: number): string {
  const localDate = utcToLocal(utcDateString);
  localDate.setDate(localDate.getDate() + days);
  return localToUtcDateString(localDate);
}

/**
 * Check if a date falls within a range (inclusive)
 */
export function isDateInRange(
  dateToCheck: string | Date,
  startDate: string | Date,
  endDate: string | Date
): boolean {
  const check = typeof dateToCheck === 'string' ? utcToLocal(dateToCheck) : dateToCheck;
  const start = typeof startDate === 'string' ? utcToLocal(startDate) : startDate;
  const end = typeof endDate === 'string' ? utcToLocal(endDate) : endDate;
  
  // Normalize all dates to start of day
  check.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  return check >= start && check <= end;
}