/**
 * Database cleanup utilities
 * Removes invalid entries from the database
 */

import { MockDatabaseImpl } from '@/mocks/database/MockDatabase';

/**
 * Clean up invalid entries from all database collections
 */
export const cleanupInvalidEntries = () => {
  const db = MockDatabaseImpl.getInstance();
  const database = db.getDatabase();
  
  let totalCleaned = 0;
  
  // Clean up each collection
  const collections = [
    'projects', 'users', 'customers', 'factories', 
    'schedules', 'tasks', 'comments', 'productCategories', 'products'
  ] as const;
  
  collections.forEach(collectionName => {
    const collection = database[collectionName];
    if (!collection || !(collection instanceof Map)) return;
    
    const invalidKeys: any[] = [];
    
    // Find invalid entries
    for (const [key, value] of collection.entries()) {
      // Keys must be strings
      if (typeof key !== 'string') {
        console.warn(`[Cleanup] ${collectionName}: Invalid key type ${typeof key}:`, key);
        invalidKeys.push(key);
        continue;
      }
      
      // Values must exist
      if (!value) {
        console.warn(`[Cleanup] ${collectionName}: Null/undefined value for key ${key}`);
        invalidKeys.push(key);
        continue;
      }
    }
    
    // Remove invalid entries
    invalidKeys.forEach(key => {
      collection.delete(key);
      totalCleaned++;
    });
    
    if (invalidKeys.length > 0) {
      console.log(`[Cleanup] ${collectionName}: Removed ${invalidKeys.length} invalid entries`);
    }
  });
  
  if (totalCleaned > 0) {
    // Save cleaned database
    const storageManager = (db as any).storageManager;
    if (storageManager) {
      storageManager.saveToStorage(database);
      console.log(`[Cleanup] Total cleaned: ${totalCleaned} entries across all collections`);
    }
  }
  
  return totalCleaned;
};

// Export for console usage
(window as any).cleanupInvalidEntries = cleanupInvalidEntries;