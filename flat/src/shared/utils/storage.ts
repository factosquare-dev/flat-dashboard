/**
 * Centralized localStorage utilities with error handling
 */

import { logger } from './logger';

/**
 * Safely get item from localStorage
 */
export function getStorageItem<T = string>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    // Try to parse as JSON, fallback to string
    try {
      return JSON.parse(item) as T;
    } catch {
      return item as unknown as T;
    }
  } catch (error) {
    logger.warn('Failed to get item from localStorage', { key, error });
    return null;
  }
}

/**
 * Safely set item in localStorage
 */
export function setStorageItem(key: string, value: any): boolean {
  try {
    const serialized = typeof value === 'string' 
      ? value 
      : JSON.stringify(value);
    
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    logger.warn('Failed to set item in localStorage', { key, error });
    return false;
  }
}

/**
 * Safely remove item from localStorage
 */
export function removeStorageItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    logger.warn('Failed to remove item from localStorage', { key, error });
    return false;
  }
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear all localStorage items
 */
export function clearStorage(): boolean {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    logger.warn('Failed to clear localStorage', { error });
    return false;
  }
}

/**
 * Get storage size in bytes
 */
export function getStorageSize(): number {
  try {
    let size = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        size += localStorage[key].length + key.length;
      }
    }
    return size;
  } catch (error) {
    logger.warn('Failed to calculate storage size', { error });
    return 0;
  }
}