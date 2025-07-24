/**
 * Initialize mock system
 * This file ensures the mock database is initialized when imported
 */

import { USE_MOCK_DATA } from './mockData';
import { initializeServices } from './services';
import { MockDatabaseImpl } from './database/MockDatabase';

// Force initialization of the mock system
let initialized = false;

export function ensureMockSystemInitialized(): boolean {
  if (initialized) {
    return true;
  }
  
  if (USE_MOCK_DATA) {
    try {
      console.log('[Mock System] Initializing...');
      
      // Ensure database is loaded
      const db = MockDatabaseImpl.getInstance();
      
      // Verify database is accessible
      const database = db.getDatabase();
      if (!database) {
        console.error('[Mock System] Failed to get database');
        return false;
      }
      
      // Initialize services
      initializeServices();
      
      console.log('[Mock System] Initialized successfully');
      console.log('[Mock System] Database stats:', db.getStats());
      
      initialized = true;
      return true;
    } catch (error) {
      console.error('[Mock System] Initialization failed:', error);
      return false;
    }
  }
  
  return false;
}

// Initialize on import
ensureMockSystemInitialized();

export { USE_MOCK_DATA };