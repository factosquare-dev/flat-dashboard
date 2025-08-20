/**
 * Consolidated utilities - Combined common functions to remove duplicates
 */

// ============================================================================
// RE-EXPORTS FROM UNIFIED DATE UTILS
// All date utilities have been moved to unifiedDateUtils.ts
// ============================================================================

export { 
  parseDate,
  formatDate,
  getDaysBetween,
  isToday,
  startOfDay as normalizeToStartOfDay,
  toLocalDateString as formatDateISO,
  formatRelativeTime,
  isValidDateString,
  isValidDateRange,
  isWeekend,
  getWeekNumber,
  calculateResizeDateFromX,
  calculateHoveredDateIndex,
  calculateSnapIndicatorX
} from './unifiedDateUtils';

// ============================================================================
// RE-EXPORTS FROM NUMBER UTILITIES
// ============================================================================

export {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatKoreanNumber,
  parseCurrency,
  parseKoreanNumber,
  isInRange,
  clamp
} from './numberUtils';

// ============================================================================
// RE-EXPORTS FROM COMPANY UTILITIES
// ============================================================================

export { simplifyCompanyName, formatCompanyNameForDisplay, formatManufacturerDisplay } from './companyUtils';

// ============================================================================
// RE-EXPORTS FROM STRING UTILITIES
// Some functions are already in stringUtils.ts with different names
// ============================================================================

export { truncate as truncateText, getInitials, formatPhoneNumber } from './stringUtils';
export { sanitizeInput } from './validationUtils';

// ============================================================================
// RE-EXPORTS FROM VALIDATION UTILITIES
// ============================================================================

export {
  isValidEmail,
  isValidPhoneNumber,
  validateRequiredFields,
  isValidLength,
  validationMessages
} from './validationUtils';

// ============================================================================
// RE-EXPORTS FROM ARRAY UTILITIES
// ============================================================================

export {
  unique as removeDuplicates,
  groupBy,
  sortBy
} from './common/arrays';

// ============================================================================
// RE-EXPORTS FROM FILE UTILITIES
// ============================================================================

export {
  formatFileSize,
  getFileExtension,
  isImageFile
} from './fileHelpers';

// ============================================================================
// RE-EXPORTS FROM OBJECT UTILITIES
// ============================================================================

export {
  deepClone,
  pick,
  omit
} from './objectHelpers';

// ============================================================================
// RE-EXPORTS FROM ASYNC UTILITIES
// ============================================================================

export {
  debounce,
  throttle,
  sleep,
  retry
} from './asyncHelpers';