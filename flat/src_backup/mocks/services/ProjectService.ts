/**
 * Project Service
 * Main service that delegates to specialized services
 */

import { Project, ProjectType, ProjectStatus } from '@/types/project';
import { DbResponse } from '@/mocks/database/types';
import { 
  ProjectCrudService,
  ProjectRelationsService,
  ProjectQueryService,
  ProjectValidationService
} from './project';
import type { ProjectWithRelations, CreateProjectData } from './project/types';
import { MockDatabaseImpl } from '@/mocks/database/MockDatabase';

export type { ProjectWithRelations, CreateProjectData };

export class ProjectService {
  private crud: ProjectCrudService;
  private relations: ProjectRelationsService;
  private query: ProjectQueryService;
  private validation: ProjectValidationService;

  constructor() {
    this.crud = new ProjectCrudService();
    this.relations = new ProjectRelationsService();
    this.query = new ProjectQueryService();
    this.validation = new ProjectValidationService();
  }

  // CRUD Operations
  async create(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<DbResponse<Project>> {
    const db = MockDatabaseImpl.getInstance();
    
    // Use createSubProject for SUB projects to inherit from Master
    if (data.type === ProjectType.SUB && data.parentId) {
      return db.createSubProject(data as Partial<Project>);
    }
    
    // Regular create for other project types
    return this.crud.create(data);
  }

  async update(id: string, data: Partial<Project>): Promise<DbResponse<Project>> {
    // Use updateProject for Master-SUB synchronization
    const db = MockDatabaseImpl.getInstance();
    return db.updateProject(id, data);
  }

  async delete(projectId: string): Promise<DbResponse<void>> {
    return this.crud.delete(projectId);
  }

  async getById(id: string): Promise<DbResponse<Project>> {
    // Use getProject for automatic Master aggregation
    const db = MockDatabaseImpl.getInstance();
    return db.getProject(id);
  }

  async getAll(): Promise<DbResponse<Project[]>> {
    // Use getAllProjects for automatic Master aggregation
    const db = MockDatabaseImpl.getInstance();
    return db.getAllProjects();
  }

  async updateStatus(projectId: string, status: ProjectStatus): Promise<DbResponse<Project>> {
    return this.crud.updateStatus(projectId, status);
  }

  async updateProgress(projectId: string, progress: number): Promise<DbResponse<Project>> {
    return this.crud.updateProgress(projectId, progress);
  }

  // Relations Operations
  async createWithRelations(data: CreateProjectData): Promise<DbResponse<ProjectWithRelations>> {
    return this.relations.createWithRelations(data);
  }

  async getByIdWithRelations(projectId: string): Promise<DbResponse<ProjectWithRelations>> {
    return this.relations.getByIdWithRelations(projectId);
  }

  async getProjectUsers(projectId: string): Promise<DbResponse<Array<any>>> {
    return this.relations.getProjectUsers(projectId);
  }

  async getUserProjects(userId: string, role?: 'manager' | 'member' | 'viewer'): Promise<DbResponse<Project[]>> {
    return this.relations.getUserProjects(userId, role);
  }

  // Query Operations
  async getByStatus(status: ProjectStatus): Promise<DbResponse<Project[]>> {
    return this.query.getByStatus(status);
  }

  async getByCustomer(customerId: string): Promise<DbResponse<Project[]>> {
    return this.query.getByCustomer(customerId);
  }

  async getByType(type: ProjectType): Promise<DbResponse<Project[]>> {
    return this.query.getByType(type);
  }

  async getByFactory(factoryId: string, factoryType?: 'manufacturer' | 'container' | 'packaging'): Promise<DbResponse<Project[]>> {
    return this.query.getByFactory(factoryId, factoryType);
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<DbResponse<Project[]>> {
    return this.query.getByDateRange(startDate, endDate);
  }

  async getOverdueProjects(): Promise<DbResponse<Project[]>> {
    return this.query.getOverdueProjects();
  }

  async searchProjects(query: string): Promise<DbResponse<Project[]>> {
    return this.query.searchProjects(query);
  }

  async getProjectStats(): Promise<DbResponse<any>> {
    return this.query.getProjectStats();
  }

  // Validation Operations
  async syncSubProjectsWithMaster(masterId: string): Promise<DbResponse<number>> {
    return this.validation.syncSubProjectsWithMaster(masterId);
  }

  async validateMasterSubConsistency(projectId: string): Promise<DbResponse<{ isValid: boolean; errors: string[] }>> {
    return this.validation.validateMasterSubConsistency(projectId);
  }

  async validateProjectDates(projectId: string): Promise<DbResponse<{ isValid: boolean; errors: string[] }>> {
    return this.validation.validateProjectDates(projectId);
  }

  async validateProjectDependencies(projectId: string): Promise<DbResponse<{ isValid: boolean; errors: string[] }>> {
    return this.validation.validateProjectDependencies(projectId);
  }
}