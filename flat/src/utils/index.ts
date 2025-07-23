/**
 * Utilities export barrel
 */

// Re-export existing utilities
export * from './apiClient';
export { formatCurrency, parseCurrency } from './currency';
export { getDayNumber, formatDayNumberRange, getDaysFromToday, isDateInRange } from './dateUtils';
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

// Export error handling utilities
export { 
  ErrorHandler,
  handleApiError,
  handleComponentError,
  handleAsync,
  retryOperation
} from './errorHandler';