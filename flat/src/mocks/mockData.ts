/**
 * Mock Data Configuration
 * Controls whether to use mock data or real API
 */

// Enable mock data by default in development
export const USE_MOCK_DATA = import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_DATA === 'true';