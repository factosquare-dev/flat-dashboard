/**
 * Initialize mock system
 * This file ensures the mock database is initialized when imported
 */

import { USE_MOCK_DATA } from '@/config/mock';
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
      
      // Ensure database is loaded
      const db = MockDatabaseImpl.getInstance();
      
      // Verify database is accessible
      const database = db.getDatabase();
      if (!database) {
        return false;
      }
      
      // Initialize services
      initializeServices();
      
      initialized = true;
      return true;
    } catch (error) {
      return false;
    }
  }
  
  return false;
}

// Initialize on import
ensureMockSystemInitialized();

export { USE_MOCK_DATA };