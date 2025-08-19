/**
 * Storage Service - Abstraction layer for localStorage
 * 
 * Benefits:
 * - Type-safe storage operations
 * - Automatic JSON serialization/deserialization
 * - Error handling and fallback values
 * - Storage quota management
 * - Consistent key prefixing
 */

import { logger } from '@/utils/logger';

export interface StorageItem<T> {
  value: T;
  timestamp: number;
  expiresAt?: number;
}

export interface StorageOptions {
  expiresIn?: number; // milliseconds
  prefix?: string;
}

class StorageService {
  private readonly prefix: string;
  private readonly storage: Storage;

  constructor(storage: Storage = window.localStorage, prefix: string = 'flat_') {
    this.storage = storage;
    this.prefix = prefix;
  }

  /**
   * Get an item from storage
   */
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const fullKey = this.getFullKey(key);
      const item = this.storage.getItem(fullKey);
      
      if (!item) {
        return defaultValue ?? null;
      }

      const parsed: StorageItem<T> = JSON.parse(item);
      
      // Check if item has expired
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        this.remove(key);
        return defaultValue ?? null;
      }

      return parsed.value;
    } catch (error) {
      logger.error('Storage get error:', { key, error });
      return defaultValue ?? null;
    }
  }

  /**
   * Set an item in storage
   */
  set<T>(key: string, value: T, options?: StorageOptions): boolean {
    try {
      const fullKey = this.getFullKey(key);
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        ...(options?.expiresIn && {
          expiresAt: Date.now() + options.expiresIn
        })
      };

      this.storage.setItem(fullKey, JSON.stringify(item));
      return true;
    } catch (error) {
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        logger.warn('Storage quota exceeded, attempting cleanup...');
        this.cleanup();
        
        // Try again after cleanup
        try {
          const fullKey = this.getFullKey(key);
          this.storage.setItem(fullKey, JSON.stringify({ value, timestamp: Date.now() }));
          return true;
        } catch (retryError) {
          logger.error('Storage set error after cleanup:', { key, error: retryError });
          return false;
        }
      }
      
      logger.error('Storage set error:', { key, error });
      return false;
    }
  }

  /**
   * Remove an item from storage
   */
  remove(key: string): boolean {
    try {
      const fullKey = this.getFullKey(key);
      this.storage.removeItem(fullKey);
      return true;
    } catch (error) {
      logger.error('Storage remove error:', { key, error });
      return false;
    }
  }

  /**
   * Clear all items with the current prefix
   */
  clear(): boolean {
    try {
      const keys = this.keys();
      keys.forEach(key => {
        this.storage.removeItem(this.getFullKey(key));
      });
      return true;
    } catch (error) {
      logger.error('Storage clear error:', error);
      return false;
    }
  }

  /**
   * Get all keys with the current prefix
   */
  keys(): string[] {
    const keys: string[] = [];
    const prefixLength = this.prefix.length;
    
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key?.startsWith(this.prefix)) {
        keys.push(key.substring(prefixLength));
      }
    }
    
    return keys;
  }

  /**
   * Check if a key exists in storage
   */
  has(key: string): boolean {
    const fullKey = this.getFullKey(key);
    return this.storage.getItem(fullKey) !== null;
  }

  /**
   * Get storage size in bytes
   */
  getSize(): number {
    let size = 0;
    const keys = this.keys();
    
    keys.forEach(key => {
      const fullKey = this.getFullKey(key);
      const item = this.storage.getItem(fullKey);
      if (item) {
        size += item.length * 2; // UTF-16 uses 2 bytes per character
      }
    });
    
    return size;
  }

  /**
   * Clean up expired items
   */
  cleanup(): number {
    let removed = 0;
    const keys = this.keys();
    
    keys.forEach(key => {
      try {
        const fullKey = this.getFullKey(key);
        const item = this.storage.getItem(fullKey);
        
        if (item) {
          const parsed: StorageItem<unknown> = JSON.parse(item);
          
          if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
            this.storage.removeItem(fullKey);
            removed++;
          }
        }
      } catch (error) {
        // Remove corrupted items
        this.storage.removeItem(this.getFullKey(key));
        removed++;
      }
    });
    
    logger.info(`Storage cleanup completed: ${removed} items removed`);
    return removed;
  }

  /**
   * Get full key with prefix
   */
  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Create a namespaced storage instance
   */
  namespace(namespace: string): StorageService {
    return new StorageService(this.storage, `${this.prefix}${namespace}_`);
  }
}

// Create default instances
export const localStorage = new StorageService(window.localStorage);
export const sessionStorage = new StorageService(window.sessionStorage, 'flat_session_');

// Export default instance
export default localStorage;