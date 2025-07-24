/**
 * Mock Database Implementation
 * Simulates a real database with persistence, relationships, and CRUD operations
 */

import { 
  MockDatabase, 
  DbResponse, 
  DbEvent, 
  DbEventType,
  DbTransaction,
  DbOperation,
  DbStats
} from './types';
import { seedData } from './seedData';

export class MockDatabaseImpl {
  private static instance: MockDatabaseImpl;
  private db: MockDatabase;
  private listeners: Map<string, Set<(event: DbEvent) => void>>;
  private transactions: Map<string, DbTransaction>;
  private readonly STORAGE_KEY = 'flat_mock_db';
  private readonly VERSION = '1.0.0';

  private constructor() {
    this.listeners = new Map();
    this.transactions = new Map();
    this.db = this.initializeDatabase();
  }

  static getInstance(): MockDatabaseImpl {
    if (!MockDatabaseImpl.instance) {
      MockDatabaseImpl.instance = new MockDatabaseImpl();
    }
    return MockDatabaseImpl.instance;
  }

  /**
   * Initialize database from localStorage or seed data
   */
  private initializeDatabase(): MockDatabase {
    const stored = this.loadFromStorage();
    
    if (stored && stored.version === this.VERSION) {
      return this.deserializeDatabase(stored.data);
    }

    // Initialize with seed data
    const db = seedData.createInitialData();
    this.saveToStorage(db);
    return db;
  }

  /**
   * Serialize database for storage
   */
  private serializeDatabase(db: MockDatabase): any {
    return {
      users: Array.from(db.users.entries()),
      customers: Array.from(db.customers.entries()),
      factories: Array.from(db.factories.entries()),
      projects: Array.from(db.projects.entries()),
      schedules: Array.from(db.schedules.entries()),
      tasks: Array.from(db.tasks.entries()),
      comments: Array.from(db.comments.entries()),
      userFactories: Array.from(db.userFactories.entries()),
      projectAssignments: Array.from(db.projectAssignments.entries()),
      factoryProjects: Array.from(db.factoryProjects.entries()),
      userCustomers: Array.from(db.userCustomers.entries()),
    };
  }

  /**
   * Deserialize database from storage
   */
  private deserializeDatabase(data: any): MockDatabase {
    // Helper function to convert date strings to Date objects
    const convertDates = (obj: any): any => {
      if (!obj) return obj;
      
      // Date fields to convert
      const dateFields = ['createdAt', 'updatedAt', 'startDate', 'endDate', 'establishedDate', 'lastLoginAt', 'assignedAt', 'approvedAt', 'completedAt'];
      
      dateFields.forEach(field => {
        if (obj[field] && typeof obj[field] === 'string') {
          obj[field] = new Date(obj[field]);
        }
      });
      
      return obj;
    };
    
    // Convert all entries to restore Date objects
    const processEntries = (entries: any[]) => {
      return entries?.map(([key, value]) => [key, convertDates(value)]) || [];
    };
    
    return {
      users: new Map(processEntries(data.users)),
      customers: new Map(processEntries(data.customers)),
      factories: new Map(processEntries(data.factories)),
      projects: new Map(processEntries(data.projects)),
      schedules: new Map(processEntries(data.schedules)),
      tasks: new Map(processEntries(data.tasks)),
      comments: new Map(processEntries(data.comments)),
      userFactories: new Map(processEntries(data.userFactories)),
      projectAssignments: new Map(processEntries(data.projectAssignments)),
      factoryProjects: new Map(processEntries(data.factoryProjects)),
      userCustomers: new Map(processEntries(data.userCustomers)),
    };
  }

  /**
   * Save database to localStorage
   */
  private saveToStorage(db: MockDatabase): void {
    try {
      const data = {
        version: this.VERSION,
        timestamp: new Date().toISOString(),
        data: this.serializeDatabase(db),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save database to storage:', error);
    }
  }

  /**
   * Load database from localStorage
   */
  private loadFromStorage(): any {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load database from storage:', error);
      return null;
    }
  }

  /**
   * Get the database instance
   */
  getDatabase(): MockDatabase {
    return this.db;
  }

  /**
   * Emit database event
   */
  private emitEvent(event: DbEvent): void {
    const listeners = this.listeners.get(event.collection) || new Set();
    const globalListeners = this.listeners.get('*') || new Set();

    [...listeners, ...globalListeners].forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in database event listener:', error);
      }
    });
  }

  /**
   * Generic CRUD Operations
   */
  async create<T extends keyof MockDatabase>(
    collection: T,
    id: string,
    data: MockDatabase[T] extends Map<string, infer V> ? V : never
  ): Promise<DbResponse<typeof data>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const map = this.db[collection] as Map<string, typeof data>;
          
          if (map.has(id)) {
            resolve({
              success: false,
              error: `${collection} with id ${id} already exists`,
            });
            return;
          }

          map.set(id, data);
          this.saveToStorage(this.db);
          
          this.emitEvent({
            type: 'created',
            collection,
            id,
            data,
            timestamp: new Date(),
          });

          resolve({
            success: true,
            data,
            message: `${collection} created successfully`,
          });
        } catch (error) {
          resolve({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }, 100); // Simulate network delay
    });
  }

  async update<T extends keyof MockDatabase>(
    collection: T,
    id: string,
    data: Partial<MockDatabase[T] extends Map<string, infer V> ? V : never>
  ): Promise<DbResponse<MockDatabase[T] extends Map<string, infer V> ? V : never>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const map = this.db[collection] as Map<string, any>;
          const existing = map.get(id);
          
          if (!existing) {
            resolve({
              success: false,
              error: `${collection} with id ${id} not found`,
            });
            return;
          }

          const updated = { ...existing, ...data };
          map.set(id, updated);
          this.saveToStorage(this.db);
          
          this.emitEvent({
            type: 'updated',
            collection,
            id,
            data: updated,
            timestamp: new Date(),
          });

          resolve({
            success: true,
            data: updated,
            message: `${collection} updated successfully`,
          });
        } catch (error) {
          resolve({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }, 100);
    });
  }

  async delete<T extends keyof MockDatabase>(
    collection: T,
    id: string
  ): Promise<DbResponse<void>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const map = this.db[collection] as Map<string, any>;
          
          if (!map.has(id)) {
            resolve({
              success: false,
              error: `${collection} with id ${id} not found`,
            });
            return;
          }

          // Check for referential integrity
          const canDelete = this.checkReferentialIntegrity(collection, id);
          if (!canDelete.success) {
            resolve(canDelete);
            return;
          }

          map.delete(id);
          this.saveToStorage(this.db);
          
          this.emitEvent({
            type: 'deleted',
            collection,
            id,
            timestamp: new Date(),
          });

          resolve({
            success: true,
            message: `${collection} deleted successfully`,
          });
        } catch (error) {
          resolve({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }, 100);
    });
  }

  async get<T extends keyof MockDatabase>(
    collection: T,
    id: string
  ): Promise<DbResponse<MockDatabase[T] extends Map<string, infer V> ? V : never>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const map = this.db[collection] as Map<string, any>;
          const data = map.get(id);
          
          if (!data) {
            resolve({
              success: false,
              error: `${collection} with id ${id} not found`,
            });
            return;
          }

          resolve({
            success: true,
            data,
          });
        } catch (error) {
          resolve({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }, 50);
    });
  }

  async getAll<T extends keyof MockDatabase>(
    collection: T
  ): Promise<DbResponse<Array<MockDatabase[T] extends Map<string, infer V> ? V : never>>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const map = this.db[collection] as Map<string, any>;
          const data = Array.from(map.values());
          
          resolve({
            success: true,
            data,
          });
        } catch (error) {
          resolve({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }, 50);
    });
  }

  /**
   * Check referential integrity before deletion
   */
  private checkReferentialIntegrity(collection: keyof MockDatabase, id: string): DbResponse<void> {
    // Check if user is referenced
    if (collection === 'users') {
      const hasFactoryRelation = Array.from(this.db.userFactories.values())
        .some(uf => uf.userId === id);
      const hasProjectRelation = Array.from(this.db.projectAssignments.values())
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
      const hasProjectRelation = Array.from(this.db.factoryProjects.values())
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
      const hasSchedule = Array.from(this.db.schedules.values())
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
   * Transaction support
   */
  beginTransaction(): string {
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.transactions.set(transactionId, {
      id: transactionId,
      operations: [],
      status: 'pending',
      timestamp: new Date(),
    });
    return transactionId;
  }

  async commitTransaction(transactionId: string): Promise<DbResponse<void>> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      return {
        success: false,
        error: 'Transaction not found',
      };
    }

    try {
      // Apply all operations
      for (const op of transaction.operations) {
        // Apply operation logic here
      }

      transaction.status = 'committed';
      this.saveToStorage(this.db);
      
      return {
        success: true,
        message: 'Transaction committed successfully',
      };
    } catch (error) {
      await this.rollbackTransaction(transactionId);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed',
      };
    }
  }

  async rollbackTransaction(transactionId: string): Promise<DbResponse<void>> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      return {
        success: false,
        error: 'Transaction not found',
      };
    }

    // Rollback operations in reverse order
    for (let i = transaction.operations.length - 1; i >= 0; i--) {
      const op = transaction.operations[i];
      if (op.type === 'create') {
        this.db[op.collection].delete(op.id);
      } else if (op.type === 'update' && op.previousData) {
        (this.db[op.collection] as Map<string, any>).set(op.id, op.previousData);
      } else if (op.type === 'delete' && op.previousData) {
        (this.db[op.collection] as Map<string, any>).set(op.id, op.previousData);
      }
    }

    transaction.status = 'rolled-back';
    this.saveToStorage(this.db);
    
    return {
      success: true,
      message: 'Transaction rolled back successfully',
    };
  }

  /**
   * Event subscription
   */
  subscribe(collection: keyof MockDatabase | '*', callback: (event: DbEvent) => void): () => void {
    if (!this.listeners.has(collection)) {
      this.listeners.set(collection, new Set());
    }
    
    this.listeners.get(collection)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(collection)?.delete(callback);
    };
  }

  /**
   * Database statistics
   */
  getStats(): DbStats {
    const stats: DbStats = {
      collections: {} as any,
      relationships: {
        userFactories: this.db.userFactories.size,
        projectAssignments: this.db.projectAssignments.size,
        factoryProjects: this.db.factoryProjects.size,
      },
      totalSize: 0,
      version: this.VERSION,
    };

    // Calculate collection stats
    Object.keys(this.db).forEach((key) => {
      const collection = key as keyof MockDatabase;
      if (collection.includes('Map')) return;
      
      const map = this.db[collection];
      stats.collections[collection] = {
        count: map.size,
        lastModified: new Date(), // In real implementation, track this
      };
    });

    // Calculate total size
    const dbString = JSON.stringify(this.serializeDatabase(this.db));
    stats.totalSize = new Blob([dbString]).size;

    return stats;
  }

  /**
   * Reset database
   */
  reset(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.db = this.initializeDatabase();
    this.emitEvent({
      type: 'disconnected',
      collection: 'users',
      timestamp: new Date(),
    });
  }

  /**
   * Export database
   */
  export(): string {
    return JSON.stringify(this.serializeDatabase(this.db), null, 2);
  }

  /**
   * Import database
   */
  import(data: string): DbResponse<void> {
    try {
      const parsed = JSON.parse(data);
      this.db = this.deserializeDatabase(parsed);
      this.saveToStorage(this.db);
      return {
        success: true,
        message: 'Database imported successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid database format',
      };
    }
  }
}