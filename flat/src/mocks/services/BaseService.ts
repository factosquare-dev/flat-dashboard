/**
 * Base Service for Mock Database Operations
 * Provides common CRUD functionality for all services
 */

import { MockDatabaseImpl } from '../database/MockDatabase';
import { DbResponse, QueryOptions, QueryResult } from '../database/types';

export abstract class BaseService<T> {
  protected db: MockDatabaseImpl;
  protected collection: keyof MockDatabaseImpl['db'];

  constructor(collection: keyof MockDatabaseImpl['db']) {
    this.db = MockDatabaseImpl.getInstance();
    this.collection = collection;
  }

  /**
   * Create a new entity
   */
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<DbResponse<T>> {
    const id = this.generateId();
    const now = new Date();
    
    const entity = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    } as T;

    return this.db.create(this.collection, id, entity);
  }

  /**
   * Get entity by ID
   */
  async getById(id: string): Promise<DbResponse<T>> {
    return this.db.get(this.collection, id);
  }

  /**
   * Update entity
   */
  async update(id: string, data: Partial<T>): Promise<DbResponse<T>> {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };
    
    return this.db.update(this.collection, id, updateData);
  }

  /**
   * Delete entity
   */
  async delete(id: string): Promise<DbResponse<void>> {
    return this.db.delete(this.collection, id);
  }

  /**
   * Get all entities
   */
  async getAll(): Promise<DbResponse<T[]>> {
    return this.db.getAll(this.collection);
  }

  /**
   * Query entities with pagination and filters
   */
  async query(options: QueryOptions): Promise<DbResponse<QueryResult<T>>> {
    const { page = 1, limit = 20, sortBy, sortOrder = 'asc', filters = {} } = options;
    
    try {
      const allData = await this.db.getAll(this.collection);
      if (!allData.success || !allData.data) {
        return {
          success: false,
          error: allData.error || 'Failed to fetch data',
        };
      }

      let filtered = allData.data;

      // Apply filters
      filtered = this.applyFilters(filtered, filters);

      // Apply sorting
      if (sortBy) {
        filtered = this.applySorting(filtered, sortBy, sortOrder);
      }

      // Calculate pagination
      const total = filtered.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedData = filtered.slice(start, end);

      return {
        success: true,
        data: {
          data: paginatedData,
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Query failed',
      };
    }
  }

  /**
   * Count entities
   */
  async count(filters?: Record<string, any>): Promise<DbResponse<number>> {
    try {
      const allData = await this.db.getAll(this.collection);
      if (!allData.success || !allData.data) {
        return {
          success: false,
          error: allData.error || 'Failed to fetch data',
        };
      }

      let filtered = allData.data;
      if (filters) {
        filtered = this.applyFilters(filtered, filters);
      }

      return {
        success: true,
        data: filtered.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Count failed',
      };
    }
  }

  /**
   * Find entities by criteria
   */
  async find(criteria: Partial<T>): Promise<DbResponse<T[]>> {
    try {
      const allData = await this.db.getAll(this.collection);
      if (!allData.success || !allData.data) {
        return {
          success: false,
          error: allData.error || 'Failed to fetch data',
        };
      }

      const filtered = allData.data.filter(item => {
        return Object.entries(criteria).every(([key, value]) => {
          return (item as any)[key] === value;
        });
      });

      return {
        success: true,
        data: filtered,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Find failed',
      };
    }
  }

  /**
   * Find one entity by criteria
   */
  async findOne(criteria: Partial<T>): Promise<DbResponse<T | null>> {
    const result = await this.find(criteria);
    
    if (!result.success) {
      return result as DbResponse<T | null>;
    }

    return {
      success: true,
      data: result.data && result.data.length > 0 ? result.data[0] : null,
    };
  }

  /**
   * Batch create entities
   */
  async batchCreate(items: Array<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<DbResponse<T[]>> {
    const created: T[] = [];
    const errors: string[] = [];

    for (const item of items) {
      const result = await this.create(item);
      if (result.success && result.data) {
        created.push(result.data);
      } else {
        errors.push(result.error || 'Unknown error');
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: `Batch create partially failed: ${errors.join(', ')}`,
        data: created,
      };
    }

    return {
      success: true,
      data: created,
      message: `Successfully created ${created.length} items`,
    };
  }

  /**
   * Generate unique ID
   */
  protected generateId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 9);
    return `${this.collection}_${timestamp}_${randomStr}`;
  }

  /**
   * Apply filters to data
   */
  protected applyFilters(data: T[], filters: Record<string, any>): T[] {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        const itemValue = (item as any)[key];
        
        // Handle null/undefined
        if (value === null || value === undefined) {
          return itemValue === value;
        }
        
        // Handle arrays (in filter)
        if (Array.isArray(value)) {
          return value.includes(itemValue);
        }
        
        // Handle date ranges
        if (key.endsWith('_from') || key.endsWith('_to')) {
          const fieldName = key.replace(/_from$|_to$/, '');
          const fieldValue = (item as any)[fieldName];
          
          if (fieldValue instanceof Date) {
            if (key.endsWith('_from')) {
              return fieldValue >= new Date(value);
            } else {
              return fieldValue <= new Date(value);
            }
          }
        }
        
        // Handle string partial matches
        if (typeof value === 'string' && typeof itemValue === 'string') {
          return itemValue.toLowerCase().includes(value.toLowerCase());
        }
        
        // Exact match
        return itemValue === value;
      });
    });
  }

  /**
   * Apply sorting to data
   */
  protected applySorting(data: T[], sortBy: string, sortOrder: 'asc' | 'desc'): T[] {
    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortBy];
      const bValue = (b as any)[sortBy];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      let comparison = 0;
      
      if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Subscribe to collection changes
   */
  subscribe(callback: (event: any) => void): () => void {
    return this.db.subscribe(this.collection, callback);
  }
}