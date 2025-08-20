/**
 * Centralized Mock Data Export
 * All mock data should be imported from this file
 */

// Re-export all mock data from centralized location
export * from './customers';
export * from './factories';
export * from './projects';
export * from './schedules';
export * from './tasks';
export * from './users';
export * from './common';

// Mock data configuration
export const MOCK_CONFIG = {
  enabled: import.meta.env.VITE_ENABLE_MOCK === 'true',
  delay: 300, // Simulated network delay in ms
  seed: 12345, // Seed for consistent random data
} as const;