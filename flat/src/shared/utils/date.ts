/**
 * Centralized date utilities
 */

/**
 * Parse date from various formats
 */
export function parseDate(date: Date | string | null | undefined): Date | null {
  if (!date) return null;
  
  const parsed = typeof date === 'string' ? new Date(date) : date;
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date | string | null | undefined): string {
  const parsed = parseDate(date);
  if (!parsed) return '';
  
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const parsed = parseDate(date);
  if (!parsed) return false;
  
  const today = new Date();
  return (
    parsed.getFullYear() === today.getFullYear() &&
    parsed.getMonth() === today.getMonth() &&
    parsed.getDate() === today.getDate()
  );
}

/**
 * Check if date is weekend
 */
export function isWeekend(date: Date | string): boolean {
  const parsed = parseDate(date);
  if (!parsed) return false;
  
  const day = parsed.getDay();
  return day === 0 || day === 6;
}

/**
 * Get start of day
 */
export function startOfDay(date: Date | string): Date {
  const parsed = parseDate(date) || new Date();
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

/**
 * Get end of day
 */
export function endOfDay(date: Date | string): Date {
  const parsed = parseDate(date) || new Date();
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 23, 59, 59, 999);
}

/**
 * Add days to date
 */
export function addDays(date: Date | string, days: number): Date {
  const parsed = parseDate(date) || new Date();
  const result = new Date(parsed);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Subtract days from date
 */
export function subtractDays(date: Date | string, days: number): Date {
  return addDays(date, -days);
}

/**
 * Get days between two dates
 */
export function getDaysBetween(startDate: Date | string, endDate: Date | string): number {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  if (!start || !end) return 0;
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if date is in range
 */
export function isDateInRange(
  date: Date | string,
  startDate: Date | string,
  endDate: Date | string
): boolean {
  const target = parseDate(date);
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  if (!target || !start || !end) return false;
  
  return target >= start && target <= end;
}

/**
 * Get week number
 */
export function getWeekNumber(date: Date | string): number {
  const parsed = parseDate(date) || new Date();
  const firstDayOfYear = new Date(parsed.getFullYear(), 0, 1);
  const pastDaysOfYear = (parsed.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * Format date range
 */
export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
  const start = formatDateISO(startDate);
  const end = formatDateISO(endDate);
  
  if (!start || !end) return '';
  
  return `${start} ~ ${end}`;
}

/**
 * Check if date string is valid
 */
export function isValidDateString(dateStr: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Check if date range is valid
 */
export function isValidDateRange(startDate: Date | string, endDate: Date | string): boolean {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  if (!start || !end) return false;
  
  return start <= end;
}

/**
 * Get month name in Korean
 */
export function getMonthNameKorean(date: Date | string): string {
  const parsed = parseDate(date);
  if (!parsed) return '';
  
  return `${parsed.getMonth() + 1}월`;
}

/**
 * Get day name in Korean
 */
export function getDayNameKorean(date: Date | string): string {
  const parsed = parseDate(date);
  if (!parsed) return '';
  
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[parsed.getDay()];
}