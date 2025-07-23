/**
 * Mock Database Export
 * Central export point for all database-related functionality
 */

export * from './types';
export { MockDatabaseImpl } from './MockDatabase';
export { seedData } from './seedData';

// Initialize database on import
import { MockDatabaseImpl } from './MockDatabase';

// Ensure database is initialized
const db = MockDatabaseImpl.getInstance();

// Export convenience functions
export const mockDb = {
  /**
   * Get database instance
   */
  getInstance: () => MockDatabaseImpl.getInstance(),
  
  /**
   * Reset database to initial state
   */
  reset: () => {
    const instance = MockDatabaseImpl.getInstance();
    instance.reset();
  },
  
  /**
   * Get database statistics
   */
  getStats: () => {
    const instance = MockDatabaseImpl.getInstance();
    return instance.getStats();
  },
  
  /**
   * Export database as JSON
   */
  export: () => {
    const instance = MockDatabaseImpl.getInstance();
    return instance.export();
  },
  
  /**
   * Import database from JSON
   */
  import: (data: string) => {
    const instance = MockDatabaseImpl.getInstance();
    return instance.import(data);
  },
  
  /**
   * Subscribe to database events
   */
  subscribe: (collection: string, callback: (event: any) => void) => {
    const instance = MockDatabaseImpl.getInstance();
    return instance.subscribe(collection as any, callback);
  },
};