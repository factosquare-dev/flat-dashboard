/**
 * Utilities export barrel
 */

// Re-export existing utilities
export * from './apiClient';
export { formatCurrency as formatCurrencyUtil, parseCurrency } from './currency';
export { formatDate as formatDateUtil, formatDateRange as formatDateRangeUtil, getDaysFromToday, isDateInRange } from './dateUtils';
export * from './scheduleUtils';
export * from './taskUtils';

// Export new utilities
export * from './arrayUtils';
export * from './filterUtils';
export { 
  formatDate,
  formatDateRange,
  getDaysBetween,
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatFileSize,
  truncateText,
  formatPhoneNumber,
  getRelativeTime,
  getInitials
} from './formatUtils';
export * from './validationUtils';

// Re-export logger
export { logger } from './logger';