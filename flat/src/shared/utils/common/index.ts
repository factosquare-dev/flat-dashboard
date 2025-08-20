/**
 * Common utilities index
 * Re-exports all utility functions from domain-specific modules
 */

// Style utilities
export { 
  cn,
  stringToColor,
  hexToRgb,
  getContrastColor
} from './styles';

// String utilities
export {
  truncate,
  capitalize,
  toKebabCase,
  toCamelCase,
  getInitials
} from './strings';

// Array and object utilities
export {
  groupBy,
  unique,
  sortBy,
  deepClone,
  isEmpty
} from './arrays';

// Validation utilities
export {
  isValidEmail,
  isValidPhone,
  isValidBusinessNumber
} from './validation';

// Type guards
export {
  isDate,
  isNumber,
  isNonEmptyString,
  isDefined
} from './typeGuards';

// Async utilities
export {
  delay,
  debounce,
  throttle
} from './async';

// URL utilities
export {
  parseQueryString,
  buildQueryString
} from './url';

// File utilities
export {
  formatFileSize,
  getFileExtension
} from './files';

// Number utilities
export {
  formatNumber,
  formatPercentage,
  parsePercentage
} from './numbers';

// Date utilities (legacy - prefer unifiedDateUtils for new code)
export {
  formatDate,
  formatDateTime,
  getRelativeTime,
  daysBetween
} from './dates';