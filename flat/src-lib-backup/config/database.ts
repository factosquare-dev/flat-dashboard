/**
 * Database configuration
 * Centralized database version and configuration management
 */

export const DATABASE_CONFIG = {
  // Current database version - increment when schema changes require data regeneration
  VERSION: '1.1.0',
  
  // Version key in localStorage
  VERSION_KEY: 'mockDbVersion',
  
  // Database storage key
  STORAGE_KEY: 'flat_mock_db',
  
  // Version history for documentation
  VERSION_HISTORY: {
    '1.0.0': 'Initial database schema',
    '1.0.1': 'Fixed task date generation',
    '1.0.2': 'Sequential task dates without overlaps',
    '1.0.3': 'Task dates for currentStage display',
    '1.0.4': 'Fix task overlap issue',
    '1.0.5': 'Fundamental fix: simple sequential task generation',
    '1.1.0': 'Added ProductCategories and Products collections'
  }
} as const;

export type DatabaseVersion = keyof typeof DATABASE_CONFIG.VERSION_HISTORY;