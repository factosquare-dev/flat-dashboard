/**
 * Mock Database Implementation
 * Simulates a real database with persistence, relationships, and CRUD operations
 */

import { 
  MockDatabase, 
  DbResponse, 
  DbEvent, 
  DbEventType,
  DbStats,
  DB_COLLECTIONS
} from './types';
import { seedData } from './seedData';
import { StorageManager } from './managers/StorageManager';
import { EventManager } from './managers/EventManager';
import { TransactionManager } from './managers/TransactionManager';
import { CrudOperations } from './managers/CrudOperations';
import { ProjectType } from '@/types/enums';
import type { Project } from '@/types/project';

export class MockDatabaseImpl {
  private static instance: MockDatabaseImpl;
  private db: MockDatabase;
  
  // Managers
  private storageManager: StorageManager;
  private eventManager: EventManager;
  private transactionManager: TransactionManager;
  private crudOperations: CrudOperations;

  private constructor() {
    // Initialize managers
    this.storageManager = new StorageManager();
    this.eventManager = new EventManager();
    this.transactionManager = new TransactionManager();
    this.crudOperations = new CrudOperations(this.eventManager);
    
    // Initialize database
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
    const stored = this.storageManager.loadFromStorage();
    
    if (stored && stored.version === this.storageManager.getVersion()) {
      const db = this.storageManager.deserializeDatabase(stored.data);
      
      // Check if factories have old Korean string types and force refresh if needed
      const hasOldFactoryTypes = Array.from(db.factories.values()).some(factory => 
        typeof factory.type === 'string' && ['제조', '용기', '포장'].includes(factory.type)
      );
      
      if (hasOldFactoryTypes) {
        // Detected old factory types, reinitializing database with enum types
        localStorage.removeItem(this.storageManager.getStorageKey());
        // Create new database with seed data
        const newDb = seedData.createInitialData();
        this.storageManager.saveToStorage(newDb);
        return newDb;
      }
      
      return db;
    }

    // Initialize with seed data
    const db = seedData.createInitialData();
    
    // Store db temporarily to allow updateMasterProjectAggregates to work
    this.db = db;
    
    // Update Master project aggregates after database is created
    const masterProjects = Array.from(db.projects.values()).filter(p => p.type === ProjectType.MASTER);
    masterProjects.forEach(master => {
      this.updateMasterProjectAggregates(master.id);
    });
    
    this.storageManager.saveToStorage(db);
    return db;
  }

  /**
   * Get database instance
   */
  getDatabase(): MockDatabase {
    return this.db;
  }

  /**
   * CRUD Operations
   */
  async create<T>(collection: keyof MockDatabase, id: string, data: T): Promise<DbResponse<T>> {
    // Check referential integrity before creating
    const integrityCheck = this.crudOperations.checkReferentialIntegrity(this.db, collection, id);
    if (!integrityCheck.success) {
      return integrityCheck as DbResponse<T>;
    }
    
    const result = await this.crudOperations.create(this.db, collection, id, data);
    if (result.success) {
      this.storageManager.saveToStorage(this.db);
    }
    return result;
  }

  async get<T>(collection: keyof MockDatabase, id: string): Promise<DbResponse<T>> {
    return this.crudOperations.get(this.db, collection, id);
  }

  /**
   * Alias for get method for better readability
   */
  async getById<T>(collection: keyof MockDatabase, id: string): Promise<DbResponse<T>> {
    return this.get<T>(collection, id);
  }

  async getAll<T>(collection: keyof MockDatabase): Promise<DbResponse<T[]>> {
    return this.crudOperations.getAll(this.db, collection);
  }

  async update<T>(collection: keyof MockDatabase, id: string, updates: Partial<T>): Promise<DbResponse<T>> {
    const result = await this.crudOperations.update(this.db, collection, id, updates);
    if (result.success) {
      this.storageManager.saveToStorage(this.db);
    }
    return result;
  }

  /**
   * Update project with Master-SUB synchronization
   */
  async updateProject(projectId: string, updates: Partial<Project>): Promise<DbResponse<Project>> {
    const projectResult = await this.get<Project>(DB_COLLECTIONS.PROJECTS, projectId);
    if (!projectResult.success || !projectResult.data) {
      return projectResult;
    }

    const project = projectResult.data;

    // If updating a SUB project's factory IDs, update Master aggregates
    if (project.type === ProjectType.SUB && project.parentId) {
      const factoryFieldsChanged = ['manufacturerId', 'containerId', 'packagingId'].some(
        field => updates[field as keyof Project] !== undefined
      );
      
      if (factoryFieldsChanged) {
        // Update the SUB project first
        const updateResult = await this.update<Project>(DB_COLLECTIONS.PROJECTS, projectId, updates);
        
        if (updateResult.success) {
          // Then update Master aggregates
          this.updateMasterProjectAggregates(project.parentId);
        }
        
        return updateResult;
      }
    }

    // If updating a Master project, sync changes to SUB projects
    if (project.type === ProjectType.MASTER) {
      const syncFields = ['customerId', 'customer', 'priority', 'serviceType'];
      const syncUpdates: Partial<Project> = {};
      
      syncFields.forEach(field => {
        if (updates[field as keyof Project] !== undefined) {
          syncUpdates[field as keyof Project] = updates[field as keyof Project];
        }
      });

      // Update Master first
      const updateResult = await this.update<Project>(DB_COLLECTIONS.PROJECTS, projectId, updates);
      
      if (updateResult.success && Object.keys(syncUpdates).length > 0) {
        // Update all SUB projects
        const subProjects = Array.from(this.db.projects.values())
          .filter(p => p.type === ProjectType.SUB && p.parentId === projectId);
          
        for (const sub of subProjects) {
          await this.update<Project>(DB_COLLECTIONS.PROJECTS, sub.id, syncUpdates);
        }
      }
      
      return updateResult;
    }

    // Regular update for other cases
    return await this.update<Project>(DB_COLLECTIONS.PROJECTS, projectId, updates);
  }

  async delete(collection: keyof MockDatabase, id: string): Promise<DbResponse<void>> {
    // Check referential integrity before deleting
    const integrityCheck = this.crudOperations.checkReferentialIntegrity(this.db, collection, id);
    if (!integrityCheck.success) {
      return integrityCheck;
    }
    
    const result = await this.crudOperations.delete(this.db, collection, id);
    if (result.success) {
      this.storageManager.saveToStorage(this.db);
    }
    return result;
  }

  /**
   * Specialized delete for projects (includes cascade)
   */
  deleteProject(projectId: string): DbResponse<void> {
    const db = this.db;
    
    // Delete related data
    // 1. Delete project assignments
    const assignments = Array.from(db.projectAssignments.values())
      .filter(pa => pa.projectId === projectId);
    assignments.forEach(pa => db.projectAssignments.delete(pa.id));
    
    // 2. Delete factory projects
    const factoryProjects = Array.from(db.factoryProjects.values())
      .filter(fp => fp.projectId === projectId);
    factoryProjects.forEach(fp => db.factoryProjects.delete(fp.id));
    
    // 3. Delete schedules and tasks
    const schedules = Array.from(db.schedules.values())
      .filter(s => s.projectId === projectId);
    schedules.forEach(schedule => {
      // Delete tasks
      const tasks = Array.from(db.tasks.values())
        .filter(t => t.scheduleId === schedule.id);
      tasks.forEach(task => db.tasks.delete(task.id));
      
      // Delete schedule
      db.schedules.delete(schedule.id);
    });
    
    // 4. Delete comments
    const comments = Array.from(db.comments.values())
      .filter(c => c.entityType === 'project' && c.entityId === projectId);
    comments.forEach(comment => db.comments.delete(comment.id));
    
    // 5. Delete the project
    const existed = db.projects.delete(projectId);
    
    if (existed) {
      this.eventManager.emitEvent(
        this.eventManager.createEvent(DbEventType.DELETED, 'projects', projectId)
      );
      this.storageManager.saveToStorage(db);
      return { success: true };
    }
    
    return {
      success: false,
      error: 'Project not found',
    };
  }

  /**
   * Transaction support
   */
  beginTransaction(): string {
    return this.transactionManager.beginTransaction();
  }

  async commitTransaction(transactionId: string): Promise<DbResponse<void>> {
    const result = await this.transactionManager.commitTransaction(transactionId, async (op) => {
      // Apply operation logic here
      switch (op.type) {
        case 'create':
          await this.create(op.collection, op.id, op.data);
          break;
        case 'update':
          await this.update(op.collection, op.id, op.data);
          break;
        case 'delete':
          await this.delete(op.collection, op.id);
          break;
      }
    });
    
    if (result.success) {
      this.storageManager.saveToStorage(this.db);
    }
    
    return result;
  }

  async rollbackTransaction(transactionId: string): Promise<DbResponse<void>> {
    return this.transactionManager.rollbackTransaction(transactionId, async (op) => {
      // Rollback operation logic
      if (op.type === 'create') {
        this.db[op.collection].delete(op.id);
      } else if (op.type === 'update' && op.previousData) {
        (this.db[op.collection] as Map<string, any>).set(op.id, op.previousData);
      } else if (op.type === 'delete' && op.previousData) {
        (this.db[op.collection] as Map<string, any>).set(op.id, op.previousData);
      }
    });
  }

  /**
   * Event subscription
   */
  subscribe(collection: keyof MockDatabase | '*', callback: (event: DbEvent) => void): () => void {
    return this.eventManager.subscribe(collection, callback);
  }

  /**
   * Get database statistics
   */
  getStats(): DbStats {
    const db = this.db;
    
    return {
      collections: {
        users: db.users.size,
        customers: db.customers.size,
        factories: db.factories.size,
        projects: db.projects.size,
        schedules: db.schedules.size,
        tasks: db.tasks.size,
        comments: db.comments.size,
        productCategories: db.productCategories.size,
        products: db.products.size,
      },
      relationships: {
        userFactories: db.userFactories.size,
        projectAssignments: db.projectAssignments.size,
        factoryProjects: db.factoryProjects.size,
        userCustomers: db.userCustomers.size,
      },
      totalSize: Object.values(db).reduce((sum, collection) => 
        sum + (collection instanceof Map ? collection.size : 0), 0
      ),
    };
  }

  /**
   * Reset database to initial state
   */
  reset(): void {
    this.db = seedData.createInitialData();
    this.storageManager.saveToStorage(this.db);
    this.eventManager.clearListeners();
    this.transactionManager.clearTransactions();
    // Database reset to initial state
  }

  /**
   * Save current state
   */
  save(): void {
    this.storageManager.saveToStorage(this.db);
  }

  /**
   * Get project with automatic aggregation for Master projects
   */
  async getProject(projectId: string): Promise<DbResponse<Project>> {
    const projectResult = await this.get<Project>(DB_COLLECTIONS.PROJECTS, projectId);
    
    if (!projectResult.success || !projectResult.data) {
      return projectResult;
    }
    
    const project = projectResult.data;
    
    // If it's a Master project, update aggregates before returning
    if (project.type === ProjectType.MASTER) {
      const aggregateResult = this.updateMasterProjectAggregates(projectId);
      if (aggregateResult.success) {
        // Get the updated project
        const updatedResult = await this.get<Project>(DB_COLLECTIONS.PROJECTS, projectId);
        return updatedResult;
      }
    }
    
    return projectResult;
  }

  /**
   * Get all projects with automatic aggregation for Master projects
   */
  async getAllProjects(): Promise<DbResponse<Project[]>> {
    const allProjectsResult = await this.getAll<Project>(DB_COLLECTIONS.PROJECTS);
    
    if (!allProjectsResult.success || !allProjectsResult.data) {
      return allProjectsResult;
    }
    
    // Update all Master projects
    const masterProjects = allProjectsResult.data.filter(p => p.type === ProjectType.MASTER);
    for (const master of masterProjects) {
      this.updateMasterProjectAggregates(master.id);
    }
    
    // Return all projects (including updated Masters)
    return await this.getAll<Project>(DB_COLLECTIONS.PROJECTS);
  }

  /**
   * Create SUB project with inheritance from Master
   */
  async createSubProject(subProjectData: Partial<Project>): Promise<DbResponse<Project>> {
    if (!subProjectData.parentId) {
      return { success: false, error: 'SUB project must have parentId' };
    }

    // Get Master project
    const masterResult = await this.getProject(subProjectData.parentId);
    if (!masterResult.success || !masterResult.data) {
      return { success: false, error: 'Master project not found' };
    }

    const master = masterResult.data;

    // Inherit fields from Master (excluding factory IDs which are aggregated from SUBs)
    const inheritedData = {
      ...subProjectData,
      type: ProjectType.SUB,
      customerId: master.customerId,
      customer: master.customer,
      priority: master.priority,
      serviceType: master.serviceType,
      // Ensure dates are within Master bounds
      startDate: subProjectData.startDate && new Date(subProjectData.startDate) < new Date(master.startDate) 
        ? master.startDate 
        : subProjectData.startDate,
      endDate: subProjectData.endDate && new Date(subProjectData.endDate) > new Date(master.endDate) 
        ? master.endDate 
        : subProjectData.endDate,
    };

    // Create the SUB project
    const createResult = await this.create<Project>(DB_COLLECTIONS.PROJECTS, inheritedData as Project);
    
    if (createResult.success) {
      // Update Master project aggregates
      this.updateMasterProjectAggregates(subProjectData.parentId);
    }

    return createResult;
  }

  /**
   * Update Master project with aggregated data from SUB projects
   */
  updateMasterProjectAggregates(masterId: string): DbResponse<void> {
    try {
      const masterProject = this.db.projects.get(masterId);
      if (!masterProject || masterProject.type !== ProjectType.MASTER) {
        return { success: false, error: 'Master project not found' };
      }

      // Get all SUB projects for this master
      const subProjects = Array.from(this.db.projects.values())
        .filter(p => p.type === ProjectType.SUB && p.parentId === masterId);

      if (subProjects.length === 0) {
        // No SUB projects, keep master as is
        return { success: true };
      }

      // Calculate aggregated values
      const aggregatedSales = subProjects.reduce((sum, sub) => {
        const sales = typeof sub.sales === 'string' ? parseFloat(sub.sales) || 0 : sub.sales || 0;
        return sum + sales;
      }, 0);

      const aggregatedPurchase = subProjects.reduce((sum, sub) => {
        const purchase = typeof sub.purchase === 'string' ? parseFloat(sub.purchase) || 0 : sub.purchase || 0;
        return sum + purchase;
      }, 0);

      // Calculate date range from SUB projects
      const subStartDates = subProjects
        .map(sub => sub.startDate)
        .filter(date => date)
        .map(date => new Date(date).getTime());
      
      const subEndDates = subProjects
        .map(sub => sub.endDate)
        .filter(date => date)
        .map(date => new Date(date).getTime());

      const earliestStartDate = subStartDates.length > 0 
        ? new Date(Math.min(...subStartDates))
        : masterProject.startDate;
      
      const latestEndDate = subEndDates.length > 0 
        ? new Date(Math.max(...subEndDates))
        : masterProject.endDate;

      // Collect all unique factory IDs from SUB projects
      const allManufacturerIds = new Set<string>();
      const allContainerIds = new Set<string>();
      const allPackagingIds = new Set<string>();

      subProjects.forEach(sub => {
        // Handle manufacturer IDs
        if (sub.manufacturerId) {
          if (Array.isArray(sub.manufacturerId)) {
            sub.manufacturerId.forEach(id => allManufacturerIds.add(id));
          } else {
            allManufacturerIds.add(sub.manufacturerId);
          }
        }
        
        // Handle container IDs
        if (sub.containerId) {
          if (Array.isArray(sub.containerId)) {
            sub.containerId.forEach(id => allContainerIds.add(id));
          } else {
            allContainerIds.add(sub.containerId);
          }
        }
        
        // Handle packaging IDs
        if (sub.packagingId) {
          if (Array.isArray(sub.packagingId)) {
            sub.packagingId.forEach(id => allPackagingIds.add(id));
          } else {
            allPackagingIds.add(sub.packagingId);
          }
        }
      });

      // Update master project with aggregated data
      // Note: Factory IDs are NOT stored in Master - they are fetched from SUBs on demand
      const updatedMaster = {
        ...masterProject,
        sales: aggregatedSales,
        purchase: aggregatedPurchase,
        startDate: earliestStartDate,
        endDate: latestEndDate,
        // Factory IDs are intentionally NOT aggregated here
        // They should be fetched from SUB projects when needed
        updatedAt: new Date()
      };

      // Save updated master project
      this.db.projects.set(masterId, updatedMaster);
      this.storageManager.saveToStorage(this.db);

      // Master project aggregates updated
      return { success: true };
    } catch (error) {
      // Error updating master project aggregates
      return { success: false, error: error.message };
    }
  }

  /**
   * Export database as JSON
   */
  export(): string {
    return this.storageManager.exportDatabase(this.db);
  }

  /**
   * Import database from JSON
   */
  import(data: string): DbResponse<void> {
    const imported = this.storageManager.importDatabase(data);
    if (imported) {
      this.db = imported;
      this.storageManager.saveToStorage(this.db);
      return { success: true };
    }
    return {
      success: false,
      error: 'Failed to import data',
    };
  }
}