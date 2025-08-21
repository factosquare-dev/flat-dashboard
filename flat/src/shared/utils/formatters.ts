/**
 * Centralized formatting utilities
 * Single source of truth for all formatting functions
 */

// ============================================
// Number Formatting
// ============================================

const DEFAULT_LOCALE = 'ko-KR';

/**
 * Format number with thousand separators
 */
export function formatNumber(
  value: number | string | null | undefined,
  decimals?: number
): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '-';
  }
  
  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  };
  
  return numValue.toLocaleString(DEFAULT_LOCALE, options);
}

/**
 * Format currency
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency: 'KRW' | 'USD' | 'EUR' | 'JPY' = 'KRW',
  decimals?: number
): string {
  if (amount === null || amount === undefined || amount === '') {
    return '-';
  }
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '-';
  }
  
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
  };
  
  // Set decimal places based on currency
  if (decimals !== undefined) {
    options.minimumFractionDigits = decimals;
    options.maximumFractionDigits = decimals;
  } else if (currency === 'KRW' || currency === 'JPY') {
    options.minimumFractionDigits = 0;
    options.maximumFractionDigits = 0;
  }
  
  const locale = currency === 'KRW' ? 'ko-KR' : 'en-US';
  return numAmount.toLocaleString(locale, options);
}

/**
 * Format percentage
 */
export function formatPercentage(
  value: number | null | undefined,
  decimals: number = 0
): string {
  if (value === null || value === undefined) {
    return '-';
  }
  
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format Korean number with units (조, 억, 만)
 */
export function formatKoreanNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '-';
  }
  
  if (numValue === 0) {
    return '0';
  }
  
  const absValue = Math.abs(numValue);
  const isNegative = numValue < 0;
  
  let result = '';
  
  if (absValue >= 1000000000000) { // 조
    const jo = Math.floor(absValue / 1000000000000);
    const remainder = absValue % 1000000000000;
    result = `${jo.toLocaleString('ko-KR')}조`;
    
    if (remainder >= 100000000) {
      const eok = Math.floor(remainder / 100000000);
      result += ` ${eok.toLocaleString('ko-KR')}억`;
    }
  } else if (absValue >= 100000000) { // 억
    const eok = Math.floor(absValue / 100000000);
    const remainder = absValue % 100000000;
    result = `${eok.toLocaleString('ko-KR')}억`;
    
    if (remainder >= 10000) {
      const man = Math.floor(remainder / 10000);
      result += ` ${man.toLocaleString('ko-KR')}만`;
    }
  } else if (absValue >= 10000) { // 만
    const man = Math.floor(absValue / 10000);
    const remainder = absValue % 10000;
    result = `${man.toLocaleString('ko-KR')}만`;
    
    if (remainder > 0) {
      result += ` ${remainder.toLocaleString('ko-KR')}`;
    }
  } else {
    result = absValue.toLocaleString('ko-KR');
  }
  
  return isNegative ? `-${result}` : result;
}

// ============================================
// Date Formatting
// ============================================

/**
 * Format date to Korean format
 */
export function formatDate(
  date: Date | string | null | undefined,
  format: 'full' | 'short' | 'date' | 'time' = 'short'
): string {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '-';
  }
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  switch (format) {
    case 'full':
      return `${year}년 ${month}월 ${day}일 ${hours}시 ${minutes}분`;
    case 'short':
      return `${year}-${month}-${day}`;
    case 'date':
      return `${year}년 ${month}월 ${day}일`;
    case 'time':
      return `${hours}:${minutes}`;
    default:
      return `${year}-${month}-${day}`;
  }
}

/**
 * Format relative time (e.g., "2일 전", "방금 전")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = typeof date === 'string' ? new Date(date) : date;
  const diff = now.getTime() - target.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}일 전`;
  } else if (hours > 0) {
    return `${hours}시간 전`;
  } else if (minutes > 0) {
    return `${minutes}분 전`;
  } else {
    return '방금 전';
  }
}

// ============================================
// Parsing Functions
// ============================================

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  const cleanedValue = value.replace(/[₩$€¥,]/g, '').trim();
  const parsed = parseFloat(cleanedValue);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parse percentage string to number
 */
export function parsePercentage(value: string): number {
  const parsed = parseFloat(value.replace('%', ''));
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parse Korean number format back to number
 */
export function parseKoreanNumber(value: string): number {
  if (!value || value.trim() === '') {
    return 0;
  }
  
  const cleanValue = value.trim();
  const isNegative = cleanValue.startsWith('-');
  const absValue = isNegative ? cleanValue.substring(1) : cleanValue;
  
  let total = 0;
  
  // Extract 조
  const joMatch = absValue.match(/(\d+)조/);
  if (joMatch) {
    total += parseInt(joMatch[1]) * 1000000000000;
  }
  
  // Extract 억
  const eokMatch = absValue.match(/(\d+)억/);
  if (eokMatch) {
    total += parseInt(eokMatch[1]) * 100000000;
  }
  
  // Extract 만
  const manMatch = absValue.match(/(\d+)만/);
  if (manMatch) {
    total += parseInt(manMatch[1]) * 10000;
  }
  
  // Extract remainder
  const remainderMatch = absValue.match(/(?:만\s+)?(\d+)(?!조|억|만)$/);
  if (remainderMatch) {
    total += parseInt(remainderMatch[1]);
  }
  
  // If no Korean units found, parse as regular number
  if (total === 0 && !joMatch && !eokMatch && !manMatch) {
    const parsed = parseFloat(absValue.replace(/,/g, ''));
    if (!isNaN(parsed)) {
      total = parsed;
    }
  }
  
  return isNegative ? -total : total;
}

// ============================================
// Other Formatters
// ============================================

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
}

/**
 * Format business registration number
 */
export function formatBusinessNumber(number: string): string {
  const cleaned = number.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
  }
  
  return number;
}