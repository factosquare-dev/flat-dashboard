/**
 * Unified Date Utilities
 * Single source of truth for all date operations in the application
 * 
 * This file re-exports utilities from domain-specific modules
 * for backward compatibility. For new code, consider importing
 * directly from the specific module.
 */

// Export from date/index.ts which should aggregate all date utilities
export * from './date/index';