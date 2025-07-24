/**
 * Database utility functions
 * Safe access to mock database
 */

import { MockDatabaseImpl } from './MockDatabase';
import type { MockDatabase } from './types';
import { ensureMockSystemInitialized } from '../initialize';

/**
 * Safely get database instance with retry mechanism
 */
export function getSafeDatabase(): MockDatabase | null {
  try {
    // Ensure mock system is initialized
    ensureMockSystemInitialized();
    
    const instance = MockDatabaseImpl.getInstance();
    
    // Check if instance is properly initialized
    if (!instance || typeof instance.getDatabase !== 'function') {
      return null;
    }
    
    const db = instance.getDatabase();
    if (!db) {
      return null;
    }
    
    return db;
  } catch (error) {
    console.error('[Database Utils] Error getting database:', error);
    return null;
  }
}

/**
 * Get database with retry mechanism
 */
export async function getDatabaseWithRetry(maxRetries: number = 3, delay: number = 100): Promise<MockDatabase | null> {
  for (let i = 0; i < maxRetries; i++) {
    const db = getSafeDatabase();
    if (db) {
      return db;
    }
    
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return null;
}