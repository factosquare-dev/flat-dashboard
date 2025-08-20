/**
 * Mock API Implementation
 * Simulates real API endpoints with realistic delays and error scenarios
 */

import { userApi, factoryApi, projectApi, databaseApi } from './endpoints';

/**
 * Mock API Endpoints
 */
export const mockApi = {
  users: userApi,
  factories: factoryApi,
  projects: projectApi,
  database: databaseApi,
};

/**
 * Initialize mock API
 */
export function initializeMockApi() {
  // Initialize services on first use
  const { initializeServices } = require('@/core/services');
  initializeServices();
  
}