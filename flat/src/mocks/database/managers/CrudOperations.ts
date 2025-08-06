/**
 * CRUD Operations Manager
 * Handles basic Create, Read, Update, Delete operations
 */

import { MockDatabase, DbResponse, DbEventType } from '../types';
import { EventManager } from './EventManager';

export class CrudOperations {
  constructor(private eventManager: EventManager) {}

  /**
   * Generic create operation
   */
  async create<T>(
    db: MockDatabase,
    collection: keyof MockDatabase,
    id: string,
    data: T
  ): Promise<DbResponse<T>> {
    // Validate ID is a string
    if (typeof id !== 'string' || !id) {
      return {
        success: false,
        error: `Invalid ID for ${collection}: ID must be a non-empty string, got ${typeof id}`,
      };
    }
    
    const targetCollection = db[collection] as Map<string, T>;
    
    if (targetCollection.has(id)) {
      return {
        success: false,
        error: `${collection} with id ${id} already exists`,
      };
    }

    targetCollection.set(id, data);
    
    this.eventManager.emitEvent(
      this.eventManager.createEvent(DbEventType.CREATED, collection, id, data)
    );

    return {
      success: true,
      data,
    };
  }

  /**
   * Generic read operation
   */
  async get<T>(
    db: MockDatabase,
    collection: keyof MockDatabase,
    id: string
  ): Promise<DbResponse<T>> {
    const targetCollection = db[collection] as Map<string, T>;
    const data = targetCollection.get(id);
    
    if (!data) {
      return {
        success: false,
        error: `${collection} with id ${id} not found`,
      };
    }

    return {
      success: true,
      data,
    };
  }

  /**
   * Generic get all operation
   */
  async getAll<T>(
    db: MockDatabase,
    collection: keyof MockDatabase
  ): Promise<DbResponse<T[]>> {
    const targetCollection = db[collection] as Map<string, T>;
    const data = Array.from(targetCollection.values());
    
    return {
      success: true,
      data,
    };
  }

  /**
   * Generic update operation
   */
  async update<T>(
    db: MockDatabase,
    collection: keyof MockDatabase,
    id: string,
    updates: Partial<T>
  ): Promise<DbResponse<T>> {
    // Validate ID is a string
    if (typeof id !== 'string' || !id) {
      return {
        success: false,
        error: `Invalid ID for ${collection}: ID must be a non-empty string, got ${typeof id}`,
      };
    }
    
    const targetCollection = db[collection] as Map<string, T>;
    const existing = targetCollection.get(id);
    
    if (!existing) {
      return {
        success: false,
        error: `${collection} with id ${id} not found`,
      };
    }

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };

    targetCollection.set(id, updated);
    
    this.eventManager.emitEvent(
      this.eventManager.createEvent(DbEventType.UPDATED, collection, id, updated, existing)
    );

    return {
      success: true,
      data: updated,
    };
  }

  /**
   * Generic delete operation
   */
  async delete(
    db: MockDatabase,
    collection: keyof MockDatabase,
    id: string
  ): Promise<DbResponse<void>> {
    const targetCollection = db[collection] as Map<string, any>;
    const existing = targetCollection.get(id);
    
    if (!existing) {
      return {
        success: false,
        error: `${collection} with id ${id} not found`,
      };
    }

    targetCollection.delete(id);
    
    this.eventManager.emitEvent(
      this.eventManager.createEvent(DbEventType.DELETED, collection, id, undefined, existing)
    );

    return {
      success: true,
    };
  }

  /**
   * Check referential integrity
   */
  checkReferentialIntegrity(
    db: MockDatabase,
    collection: keyof MockDatabase,
    id: string
  ): DbResponse<void> {
    // Check user references
    if (collection === 'users') {
      const hasFactoryRelation = Array.from(db.userFactories.values())
        .some(uf => uf.userId === id);
      
      const hasProjectRelation = Array.from(db.projectAssignments.values())
        .some(pa => pa.userId === id);
      
      if (hasFactoryRelation || hasProjectRelation) {
        return {
          success: false,
          error: 'Cannot delete user: has active relationships',
        };
      }
    }

    // Check if factory is referenced
    if (collection === 'factories') {
      const hasProjectRelation = Array.from(db.factoryProjects.values())
        .some(fp => fp.factoryId === id);
      
      if (hasProjectRelation) {
        return {
          success: false,
          error: 'Cannot delete factory: assigned to projects',
        };
      }
    }

    // Check if project is referenced
    if (collection === 'projects') {
      const hasSchedule = Array.from(db.schedules.values())
        .some(s => s.projectId === id);
      
      if (hasSchedule) {
        return {
          success: false,
          error: 'Cannot delete project: has associated schedules',
        };
      }
    }

    return { success: true };
  }

  /**
   * Bulk create operation
   */
  async bulkCreate<T>(
    db: MockDatabase,
    collection: keyof MockDatabase,
    items: Array<{ id: string; data: T }>
  ): Promise<DbResponse<T[]>> {
    const created: T[] = [];
    const errors: string[] = [];

    for (const { id, data } of items) {
      const result = await this.create(db, collection, id, data);
      if (result.success && result.data) {
        created.push(result.data);
      } else {
        errors.push(result.error || `Failed to create ${id}`);
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: `Bulk create failed: ${errors.join(', ')}`,
        data: created,
      };
    }

    return {
      success: true,
      data: created,
    };
  }

  /**
   * Bulk update operation
   */
  async bulkUpdate<T>(
    db: MockDatabase,
    collection: keyof MockDatabase,
    updates: Array<{ id: string; data: Partial<T> }>
  ): Promise<DbResponse<T[]>> {
    const updated: T[] = [];
    const errors: string[] = [];

    for (const { id, data } of updates) {
      const result = await this.update(db, collection, id, data);
      if (result.success && result.data) {
        updated.push(result.data);
      } else {
        errors.push(result.error || `Failed to update ${id}`);
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: `Bulk update failed: ${errors.join(', ')}`,
        data: updated,
      };
    }

    return {
      success: true,
      data: updated,
    };
  }
}