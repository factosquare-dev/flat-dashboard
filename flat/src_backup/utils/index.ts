/**
 * Utilities export barrel - Consolidated and optimized
 */

// Export all core utilities (combines common functions from multiple files)
export * from './coreUtils';

// Specialized utilities that don't have duplicates
export * from './scheduleUtils';
export * from './taskUtils';
export * from './filterUtils';
export * from './ganttUtils';
export * from './progressCalculator';

// Re-export logger and error handling
export { logger, PerformanceLogger } from './logger';
export { 
  ErrorHandler,
  handleApiError,
  handleComponentError,
  handleAsync,
  retryOperation
} from './errorHandler';

// Re-export API client
export * from './apiClient';

// CSS utilities
export { cn } from './cn';

// Performance utilities
export * from './performance';

// Accessibility utilities
export * from './accessibility';