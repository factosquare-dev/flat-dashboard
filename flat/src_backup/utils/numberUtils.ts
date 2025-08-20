/**
 * Number and Currency Utilities
 */

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

// Format number with Korean units (조, 억, 만)
export function formatKoreanNumber(value: number | string | null | undefined): string {
  // Handle null, undefined, or empty values
  if (value === null || value === undefined || value === '') {
    return '';
  }
  
  // Convert string to number if needed
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Return empty string for NaN or invalid numbers
  if (isNaN(numValue)) {
    return '';
  }
  
  // Handle zero
  if (numValue === 0) {
    return '0';
  }
  
  const absValue = Math.abs(numValue);
  const isNegative = numValue < 0;
  
  let result = '';
  
  if (absValue >= 1000000000000) { // 조 (trillion)
    const jo = Math.floor(absValue / 1000000000000);
    const remainder = absValue % 1000000000000;
    result = `${jo.toLocaleString('ko-KR')}조`;
    
    if (remainder >= 100000000) { // Add 억 if significant
      const eok = Math.floor(remainder / 100000000);
      result += ` ${eok.toLocaleString('ko-KR')}억`;
    }
  } else if (absValue >= 100000000) { // 억 (hundred million)
    const eok = Math.floor(absValue / 100000000);
    const remainder = absValue % 100000000;
    result = `${eok.toLocaleString('ko-KR')}억`;
    
    if (remainder >= 10000) { // Add 만 if significant
      const man = Math.floor(remainder / 10000);
      result += ` ${man.toLocaleString('ko-KR')}만`;
    }
  } else if (absValue >= 10000) { // 만 (ten thousand)
    const man = Math.floor(absValue / 10000);
    const remainder = absValue % 10000;
    result = `${man.toLocaleString('ko-KR')}만`;
    
    if (remainder > 0) { // Add remainder if exists
      result += ` ${remainder.toLocaleString('ko-KR')}`;
    }
  } else {
    result = absValue.toLocaleString('ko-KR');
  }
  
  return isNegative ? `-${result}` : result;
}

export function parseCurrency(value: string): number {
  // Remove currency symbols and commas
  const cleanedValue = value.replace(/[₩$€¥,]/g, '').trim();
  const parsed = parseFloat(cleanedValue);
  return isNaN(parsed) ? 0 : parsed;
}

// Parse Korean number format (조, 억, 만) back to number
export function parseKoreanNumber(value: string): number {
  if (!value || value.trim() === '') {
    return 0;
  }
  
  const cleanValue = value.trim();
  const isNegative = cleanValue.startsWith('-');
  const absValue = isNegative ? cleanValue.substring(1) : cleanValue;
  
  let total = 0;
  
  // Extract 조 (trillion)
  const joMatch = absValue.match(/(\d+)조/);
  if (joMatch) {
    total += parseInt(joMatch[1]) * 1000000000000;
  }
  
  // Extract 억 (hundred million)
  const eokMatch = absValue.match(/(\d+)억/);
  if (eokMatch) {
    total += parseInt(eokMatch[1]) * 100000000;
  }
  
  // Extract 만 (ten thousand)
  const manMatch = absValue.match(/(\d+)만/);
  if (manMatch) {
    total += parseInt(manMatch[1]) * 10000;
  }
  
  // Extract remainder (ones)
  const remainderMatch = absValue.match(/(?:만\s+)?(\d+)(?!조|억|만)$/);
  if (remainderMatch) {
    total += parseInt(remainderMatch[1]);
  }
  
  // If no Korean units found, try parsing as regular number
  if (total === 0 && !joMatch && !eokMatch && !manMatch) {
    const parsed = parseFloat(absValue.replace(/,/g, ''));
    if (!isNaN(parsed)) {
      total = parsed;
    }
  }
  
  return isNegative ? -total : total;
}

export function isInRange(value: number, min?: number, max?: number): boolean {
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}