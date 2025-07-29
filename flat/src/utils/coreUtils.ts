/**
 * Consolidated utilities - Combined common functions to remove duplicates
 */

// ============================================================================
// DATE & TIME UTILITIES
// ============================================================================

/**
 * Parse date string ensuring proper timezone handling
 * For date-only strings (YYYY-MM-DD), assumes UTC and converts to local
 * For ISO strings with time, converts from UTC to local
 */
export function parseDate(dateString: string): Date {
  // Date-only format (YYYY-MM-DD) - assume UTC midnight
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    // Parse as UTC and convert to local
    return new Date(dateString + 'T00:00:00Z');
  }
  
  // ISO format with time - parse normally (will convert UTC to local)
  return new Date(dateString);
}

/**
 * Normalize date to start of day in local timezone
 */
export function normalizeToStartOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export function formatDate(date: Date | string, format: 'short' | 'long' | 'iso' = 'short'): string {
  const d = typeof date === 'string' ? parseDate(date) : date;
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }
  
  switch (format) {
    case 'long':
      return d.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    case 'iso':
      return d.toISOString().split('T')[0];
    default:
      return d.toLocaleDateString('ko-KR');
  }
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
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
  
  return formatDate(d);
}

export function getDaysBetween(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isValidDateString(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
}

export function isValidDateRange(startDate: string, endDate: string): boolean {
  if (!isValidDateString(startDate) || !isValidDateString(endDate)) {
    return false;
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return start <= end;
}

export function isToday(date: Date | string): boolean {
  // For string dates, assume they're UTC from backend
  if (typeof date === 'string') {
    // Convert UTC to local for comparison
    const localDate = parseDate(date);
    const today = new Date();
    
    return localDate.getDate() === today.getDate() &&
           localDate.getMonth() === today.getMonth() &&
           localDate.getFullYear() === today.getFullYear();
  }
  
  // If Date object, compare in local timezone
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

export function formatDateISO(date: Date | string): string {
  return formatDate(date, 'iso');
}

export function isWeekend(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = d.getDay();
  return day === 0 || day === 6; // Sunday is 0, Saturday is 6
}

export function getWeekNumber(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
  const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

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

export function calculateSnapIndicatorX(
  dateIndex: number,
  cellWidth: number,
  isEnd: boolean = false
): number {
  // If it's the end position, add cellWidth to position at the end of the cell
  return dateIndex * cellWidth + (isEnd ? cellWidth : 0);
}

// ============================================================================
// NUMBER & CURRENCY UTILITIES
// ============================================================================

export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCurrency(
  amount: number,
  currency: 'KRW' | 'USD' | 'EUR' | 'JPY' = 'KRW',
  decimals?: number
): string {
  const formatOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
  };

  if (decimals !== undefined) {
    formatOptions.minimumFractionDigits = decimals;
    formatOptions.maximumFractionDigits = decimals;
  } else if (currency === 'KRW' || currency === 'JPY') {
    formatOptions.minimumFractionDigits = 0;
    formatOptions.maximumFractionDigits = 0;
  }

  const locale = currency === 'KRW' ? 'ko-KR' : 'en-US';
  return amount.toLocaleString(locale, formatOptions);
}

export function formatPercentage(value: number, decimals: number = 0): string {
  return `${formatNumber(value, decimals)}%`;
}

export function parseCurrency(value: string): number {
  // Remove currency symbols and commas
  const cleanedValue = value.replace(/[₩$€¥,]/g, '').trim();
  const parsed = parseFloat(cleanedValue);
  return isNaN(parsed) ? 0 : parsed;
}

export function isInRange(value: number, min?: number, max?: number): boolean {
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - suffix.length) + suffix;
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

export function getInitials(name: string, maxChars: number = 2): string {
  const words = name.trim().split(/\s+/);
  
  if (words.length === 1) {
    return words[0].substring(0, maxChars).toUpperCase();
  }
  
  return words
    .slice(0, maxChars)
    .map(word => word[0])
    .join('')
    .toUpperCase();
}

export function isValidLength(value: string, minLength?: number, maxLength?: number): boolean {
  if (minLength !== undefined && value.length < minLength) return false;
  if (maxLength !== undefined && value.length > maxLength) return false;
  return true;
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  } else if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  
  return phone;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/-/g, ''));
}

export function validateRequiredFields<T extends Record<string, unknown>>(
  data: T,
  requiredFields: (keyof T)[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    const value = data[field];
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      missingFields.push(String(field));
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

export function removeDuplicates<T>(array: T[], keyFn?: (item: T) => unknown): T[] {
  if (!keyFn) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(array: T[], keyFn: (item: T) => unknown, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = keyFn(a);
    const bVal = keyFn(b);
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// ============================================================================
// FILE UTILITIES
// ============================================================================

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function isImageFile(filename: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  return imageExtensions.includes(getFileExtension(filename));
}

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as T;
  }
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}

// ============================================================================
// ASYNC UTILITIES
// ============================================================================

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      await sleep(delay * attempt);
    }
  }
  
  throw lastError!;
}

// ============================================================================
// VALIDATION MESSAGES
// ============================================================================

export const validationMessages = {
  required: (field: string) => `${field} is required`,
  invalidEmail: 'Please enter a valid email address',
  invalidPhone: 'Please enter a valid phone number',
  invalidDate: 'Please enter a valid date',
  invalidDateRange: 'End date must be after or equal to start date',
  minLength: (field: string, min: number) => `${field} must be at least ${min} characters`,
  maxLength: (field: string, max: number) => `${field} must be no more than ${max} characters`,
  minValue: (field: string, min: number) => `${field} must be at least ${min}`,
  maxValue: (field: string, max: number) => `${field} must be no more than ${max}`,
} as const;