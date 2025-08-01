/**
 * Reset mock data utility
 * This function clears localStorage and resets the mock database
 */

import { storageKeys } from '../config';
import { DATABASE_CONFIG } from '../config/database';

export const resetMockData = () => {
  try {
    // Clear localStorage
    const keysToRemove = [
      storageKeys.mockDbKey,
      DATABASE_CONFIG.VERSION_KEY,
      'flat_users',
      'flat_projects',
      'flat_schedules',
      'flat_factories',
      'flat_customers'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Clear MockDB singleton instance before reload
    if ((window as any).MockDatabaseImpl) {
      (window as any).MockDatabaseImpl.instance = null;
    }
    
    // Force page reload to reinitialize mock database
    window.location.reload();
  } catch (error) {
    // Silently fail
  }
};

export const checkAndUpdateDatabaseVersion = () => {
  if (typeof window !== 'undefined') {
    const storedVersion = localStorage.getItem(DATABASE_CONFIG.VERSION_KEY);
    
    if (storedVersion !== DATABASE_CONFIG.VERSION) {
      localStorage.removeItem(storageKeys.mockDbKey);
      localStorage.setItem(DATABASE_CONFIG.VERSION_KEY, DATABASE_CONFIG.VERSION);
    }
  }
};

// Export for console usage
(window as any).resetMockData = resetMockData;