/**
 * Mock System Main Export
 * Provides a unified mock database and API system
 */

// Database exports
export * from './database';
export { mockDb } from './database';

// Service exports
export * from './services';
export { getServices, initializeServices, resetServices } from './services';

// API exports
export { mockApi, initializeMockApi } from './api/MockApi';

// Types - export specific types to avoid circular dependencies
export type { 
  MockDatabase,
  UserFactory,
  ProjectAssignment,
  FactoryProject,
  UserCustomer,
  QueryOptions,
  QueryResult,
  DbResponse,
  DbTransaction,
  DbOperation,
  DbEventType,
  DbEvent,
  DbStats
} from './database/types';

// Initialize the mock system
import { initializeServices } from './services';
import { initializeMockApi } from './api/MockApi';

// Auto-initialize on import - TEMPORARILY DISABLED
// if (typeof window !== 'undefined') {
//   // Browser environment
//   initializeServices();
//   initializeMockApi();
//   
//   // Make mock API available globally for debugging
//   (window as any).__FLAT_MOCK_API__ = {
//     services: () => import('./services').then(m => m.getServices()),
//     database: () => import('./database').then(m => m.mockDb),
//     api: () => import('./api/MockApi').then(m => m.mockApi),
//     reset: () => import('./services').then(m => m.resetServices()),
//   };
//   
//   console.log('FLAT Mock System initialized. Access via window.__FLAT_MOCK_API__');
// }