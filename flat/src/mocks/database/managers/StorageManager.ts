/**
 * Storage Manager
 * Handles database persistence and serialization
 */

import { MockDatabase } from '../types';
import { storageKeys } from '@/config';
import { DATABASE_CONFIG } from '@/config/database';

export class StorageManager {
  private readonly STORAGE_KEY = storageKeys.mockDbKey;
  private readonly VERSION = DATABASE_CONFIG.VERSION;

  /**
   * Serialize database for storage
   */
  serializeDatabase(db: MockDatabase): any {
    return {
      users: Array.from(db.users.entries()),
      customers: Array.from(db.customers.entries()),
      factories: Array.from(db.factories.entries()),
      projects: Array.from(db.projects.entries()),
      schedules: Array.from(db.schedules.entries()),
      tasks: Array.from(db.tasks.entries()),
      comments: Array.from(db.comments.entries()),
      productCategories: Array.from(db.productCategories.entries()),
      products: Array.from(db.products.entries()),
      userFactories: Array.from(db.userFactories.entries()),
      projectAssignments: Array.from(db.projectAssignments.entries()),
      factoryProjects: Array.from(db.factoryProjects.entries()),
      userCustomers: Array.from(db.userCustomers.entries()),
      statusMappings: Array.from(db.statusMappings.entries()),
      priorityMappings: Array.from(db.priorityMappings.entries()),
      serviceTypeMappings: Array.from(db.serviceTypeMappings.entries()),
      projectTypeMappings: Array.from(db.projectTypeMappings.entries()),
    };
  }

  /**
   * Deserialize database from storage
   */
  deserializeDatabase(data: any): MockDatabase {
    const deserializeDate = (dateValue: any): Date => {
      if (dateValue instanceof Date) return dateValue;
      if (typeof dateValue === 'string') return new Date(dateValue);
      return new Date();
    };

    const deserializeMap = <T>(entries: [string, T][]): Map<string, T> => {
      const map = new Map<string, T>();
      entries.forEach(([key, value]) => {
        // Handle date fields in objects
        if (value && typeof value === 'object') {
          const processed = { ...value };
          ['createdAt', 'updatedAt', 'startDate', 'endDate', 'assignedAt', 'dueDate'].forEach(field => {
            if (field in processed) {
              (processed as any)[field] = deserializeDate((processed as any)[field]);
            }
          });
          map.set(key, processed as T);
        } else {
          map.set(key, value);
        }
      });
      return map;
    };

    return {
      users: deserializeMap(data.users || []),
      customers: deserializeMap(data.customers || []),
      factories: deserializeMap(data.factories || []),
      projects: deserializeMap(data.projects || []),
      schedules: deserializeMap(data.schedules || []),
      tasks: deserializeMap(data.tasks || []),
      comments: deserializeMap(data.comments || []),
      productCategories: deserializeMap(data.productCategories || []),
      products: deserializeMap(data.products || []),
      userFactories: deserializeMap(data.userFactories || []),
      projectAssignments: deserializeMap(data.projectAssignments || []),
      factoryProjects: deserializeMap(data.factoryProjects || []),
      userCustomers: deserializeMap(data.userCustomers || []),
      statusMappings: deserializeMap(data.statusMappings || []),
      priorityMappings: deserializeMap(data.priorityMappings || []),
      serviceTypeMappings: deserializeMap(data.serviceTypeMappings || []),
      projectTypeMappings: deserializeMap(data.projectTypeMappings || []),
    };
  }

  /**
   * Save database to localStorage
   */
  saveToStorage(db: MockDatabase): void {
    try {
      const data = {
        version: this.VERSION,
        timestamp: new Date().toISOString(),
        data: this.serializeDatabase(db),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('[MockDB] Failed to save to localStorage:', error);
    }
  }

  /**
   * Load database from localStorage
   */
  loadFromStorage(): any {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('[MockDB] Failed to load from localStorage:', error);
    }
    return null;
  }

  /**
   * Export database as JSON string
   */
  exportDatabase(db: MockDatabase): string {
    return JSON.stringify(this.serializeDatabase(db), null, 2);
  }

  /**
   * Import database from JSON string
   */
  importDatabase(data: string): MockDatabase | null {
    try {
      const parsed = JSON.parse(data);
      return this.deserializeDatabase(parsed);
    } catch (error) {
      console.error('[MockDB] Failed to import data:', error);
      return null;
    }
  }

  /**
   * Get storage key
   */
  getStorageKey(): string {
    return this.STORAGE_KEY;
  }

  /**
   * Get version
   */
  getVersion(): string {
    return this.VERSION;
  }
}