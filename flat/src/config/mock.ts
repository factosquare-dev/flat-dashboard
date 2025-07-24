/**
 * Centralized Mock Data Configuration
 * All mock data settings should be imported from this file
 */

// Enable mock data based on environment
export const USE_MOCK_DATA = 
  import.meta.env.DEV || 
  import.meta.env.VITE_USE_MOCK_DATA === 'true' ||
  import.meta.env.VITE_ENABLE_MOCK === 'true';

// Mock data configuration
export const MOCK_CONFIG = {
  enabled: USE_MOCK_DATA,
  delay: 300, // Simulated network delay in ms
  seed: 12345, // Seed for consistent random data
} as const;

// Export for backward compatibility
export const ENABLE_MOCK = USE_MOCK_DATA;