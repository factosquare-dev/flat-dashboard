/**
 * Unified date parsing utilities for Schedule component
 * Handles various date formats including Korean format
 */

import { parseISO, isValid, startOfDay } from 'date-fns';

/**
 * Parse various date formats to a valid Date object at start of day
 * Handles:
 * - ISO format: "2025-07-05"
 * - Korean format: "2025. 7. 5."
 * - Date objects
 * - Date strings with time: "2025-07-05T00:00:00"
 */
export function parseScheduleDate(dateInput: string | Date): Date {
  try {
    // If it's already a Date object
    if (dateInput instanceof Date) {
      return startOfDay(dateInput);
    }
    
    let dateStr = dateInput;
    
    // Convert Korean date format to ISO format
    // "2025. 7. 5." -> "2025-07-05"
    if (dateStr.includes('. ')) {
      const parts = dateStr.replace(/\./g, '').trim().split(' ');
      if (parts.length >= 3) {
        const year = parts[0];
        const month = parts[1].padStart(2, '0');
        const day = parts[2].padStart(2, '0');
        dateStr = `${year}-${month}-${day}`;
      }
    }
    
    // Try parsing with T00:00:00 first for local timezone
    try {
      const date = new Date(dateStr + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        return startOfDay(date);
      }
    } catch (e) {}
    
    // Try parsing as ISO string
    try {
      const date = parseISO(dateStr);
      if (isValid(date)) {
        return startOfDay(date);
      }
    } catch (e) {}
    
    // Fallback to regular Date parsing
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return startOfDay(date);
    }
    
    throw new Error(`Unable to parse date: ${dateInput}`);
  } catch (error) {
    // Return today as fallback
    return startOfDay(new Date());
  }
}

