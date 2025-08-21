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
import { ProjectAggregationManager } from './managers/ProjectAggregationManager';
import { CustomFieldManager } from './managers/CustomFieldManager';
import { ProjectType } from '@/shared/types/enums';
import type { Project } from '@/shared/types/project';
import type { Comment, CommentAttachment } from '@/shared/types/comment';
import type { User } from '@/shared/types/user';
import type { Task } from '@/shared/types/schedule';

export class MockDatabaseImpl {
  private static instance: MockDatabaseImpl;
  private db: MockDatabase;
  
  // Managers
  private storageManager: StorageManager;
  private eventManager: EventManager;
  private transactionManager: TransactionManager;
  private crudOperations: CrudOperations;
  private projectAggregationManager: ProjectAggregationManager;
  private customFieldManager: CustomFieldManager;

  private constructor() {
    // Initialize managers
    this.storageManager = new StorageManager();
    this.eventManager = new EventManager();
    this.transactionManager = new TransactionManager();
    this.crudOperations = new CrudOperations(this.eventManager);
    
    // Initialize database
    this.db = this.initializeDatabase();
    
    // Initialize managers that depend on database
    this.projectAggregationManager = new ProjectAggregationManager(this.db, this.storageManager);
    this.customFieldManager = new CustomFieldManager(this.db);
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
    
    // Need to create temporary project aggregation manager for initialization
    const tempAggregationManager = new ProjectAggregationManager(db, this.storageManager);
    tempAggregationManager.updateAllMasterProjects();
    
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
          this.projectAggregationManager.updateMasterProjectAggregates(project.parentId);
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
      const aggregateResult = this.projectAggregationManager.updateMasterProjectAggregates(projectId);
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
      this.projectAggregationManager.updateMasterProjectAggregates(master.id);
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
      this.projectAggregationManager.updateMasterProjectAggregates(subProjectData.parentId);
    }

    return createResult;
  }


  /**
   * Get Custom Field Manager
   */
  getCustomFieldManager(): CustomFieldManager {
    return this.customFieldManager;
  }

  /**
   * Comment CRUD operations
   */
  createComment(data: { content: string; projectId: string; userId: string; parentId?: string; attachments?: CommentAttachment[] }): Comment | null {
    const user = this.getUserById(data.userId);
    if (!user) {
      return null;
    }

    const comment: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId: data.projectId as Project['id'],
      userId: data.userId as User['id'],
      author: {
        id: user.id,
        name: user.name,
        profileImage: user.profileImage
      },
      content: data.content,
      createdAt: new Date(),
      updatedAt: new Date(),
      parentId: data.parentId,
      reactions: [],
      attachments: data.attachments || []
    };

    this.db.comments.set(comment.id, comment);
    this.storageManager.saveToStorage(this.db);
    return comment;
  }

  getCommentsByProjectId(projectId: string): Comment[] {
    const comments: Comment[] = [];
    
    this.db.comments.forEach(comment => {
      if (comment.projectId === projectId) {
        comments.push(comment);
      }
    });
    
    return comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  updateComment(commentId: string, updates: { content?: string }): boolean {
    const comment = this.db.comments.get(commentId);
    if (!comment) return false;

    if (updates.content !== undefined) {
      comment.content = updates.content;
    }
    comment.updatedAt = new Date();

    this.db.comments.set(commentId, comment);
    this.storageManager.saveToStorage(this.db);
    return true;
  }

  deleteComment(commentId: string): boolean {
    const deleted = this.db.comments.delete(commentId);
    if (deleted) {
      this.storageManager.saveToStorage(this.db);
    }
    return deleted;
  }

  getCurrentUser(): User | null {
    // Return the first user as current user (in real app, this would be from auth)
    const users = Array.from(this.db.users.values());
    return users[0] || null;
  }

  getTaskById(taskId: string): Task | null {
    return this.db.tasks.get(taskId as any) || null;
  }

  getUserById(userId: string): User | null {
    return this.db.users.get(userId as any) || null;
  }

  /**
   * Emoji reaction operations
   */
  addReaction(commentId: string, emoji: string, userId: string): boolean {
    const comment = this.db.comments.get(commentId);
    const user = this.getUserById(userId);
    
    if (!comment || !user) return false;

    if (!comment.reactions) {
      comment.reactions = [];
    }

    const existingReaction = comment.reactions.find(r => r.emoji === emoji);
    
    if (existingReaction) {
      // Check if user already reacted with this emoji
      const userIndex = existingReaction.users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        // Add user to existing reaction
        existingReaction.users.push({
          id: userId,
          name: user.name,
          avatar: user.profileImage
        });
      } else {
        // Remove user's reaction (toggle)
        existingReaction.users.splice(userIndex, 1);
        // Remove reaction if no users left
        if (existingReaction.users.length === 0) {
          const reactionIndex = comment.reactions.indexOf(existingReaction);
          comment.reactions.splice(reactionIndex, 1);
        }
      }
    } else {
      // Add new reaction
      comment.reactions.push({
        emoji: emoji,
        users: [{
          id: userId,
          name: user.name,
          avatar: user.profileImage
        }]
      });
    }

    this.db.comments.set(commentId, comment);
    this.storageManager.saveToStorage(this.db);
    return true;
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