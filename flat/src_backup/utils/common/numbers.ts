/**
 * Number formatting utilities
 */

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '-';
  
  return new Intl.NumberFormat('ko-KR').format(num);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number | null | undefined, decimals: number = 0): string {
  if (value === null || value === undefined) return '-';
  
  return `${value.toFixed(decimals)}%`;
}

/**
 * Parse percentage string to number
 */
export function parsePercentage(value: string): number {
  const parsed = parseFloat(value.replace('%', ''));
  return isNaN(parsed) ? 0 : parsed;
}