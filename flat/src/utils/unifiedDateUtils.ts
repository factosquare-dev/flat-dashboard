/**
 * Unified Date Utilities
 * Single source of truth for all date operations in the application
 * 
 * This file re-exports utilities from domain-specific modules
 * for backward compatibility. For new code, consider importing
 * directly from the specific module.
 */

export * from './date';

// Legacy exports for backward compatibility
export * from './date/parsing';
export * from './date/formatting';
export * from './date/operations';
export * from './date/validation';
export * from './date/gantt';