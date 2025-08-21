/**
 * Date formatting utilities
 */

import { format } from 'date-fns';
import { parseDate } from './parsing';

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
        day: 'numeric'
      });
    case 'iso':
      return formatDate(d, 'yyyy-MM-dd', false);
    default:
      return formatDate(d, 'yyyy-MM-dd', false);
  }
}

/**
 * Convert Date to UTC date string (YYYY-MM-DD)
 * This is the ONLY function that should handle local to UTC conversion
 */
export function toUtcDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convert Date to local date string
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current ISO string
 */
export function getCurrentISOString(): string {
  return new Date().toISOString();
}

/**
 * Get current timestamp in ISO format
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Convert to ISO string
 */
export function toISOString(date: Date | string, isUtc: boolean = true): string {
  const d = typeof date === 'string' ? parseDate(date, isUtc) : date;
  return d.toISOString();
}

/**
 * Format relative time (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelativeTime(date: Date | string, isUtc: boolean = true): string {
  const d = typeof date === 'string' ? parseDate(date, isUtc) : date;
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const absDiff = Math.abs(diff);
  
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const minutes = Math.floor(absDiff / (1000 * 60));
  
  if (days > 0) {
    return diff > 0 ? `in ${days} day${days > 1 ? 's' : ''}` : `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return diff > 0 ? `in ${hours} hour${hours > 1 ? 's' : ''}` : `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return diff > 0 ? `in ${minutes} minute${minutes > 1 ? 's' : ''}` : `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'just now';
  }
}