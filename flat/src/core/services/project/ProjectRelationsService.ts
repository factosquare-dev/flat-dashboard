/**
 * Project Relations Service
 * Handles project relationships with users, factories, schedules, tasks, etc.
 * 
 * This file re-exports functionality from modular services
 * for backward compatibility.
 */

import { ProjectCreationService } from './relations/projectCreationService';
import { ProjectQueryService } from './relations/projectQueryService';
import { BaseService } from '@/core/services/BaseService';
import { Project } from '@/shared/types/project';

export class ProjectRelationsService extends BaseService<Project> {
  private creationService: ProjectCreationService;
  private queryService: ProjectQueryService;
  
  // Method delegates - will be bound in constructor
  createWithRelations: ProjectCreationService['createWithRelations'];
  getByIdWithRelations: ProjectQueryService['getByIdWithRelations'];
  getProjectUsers: ProjectQueryService['getProjectUsers'];
  getUserProjects: ProjectQueryService['getUserProjects'];

  constructor() {
    super('projects');
    this.creationService = new ProjectCreationService();
    this.queryService = new ProjectQueryService();
    
    // Bind methods after services are initialized
    this.createWithRelations = this.creationService.createWithRelations.bind(this.creationService);
    this.getByIdWithRelations = this.queryService.getByIdWithRelations.bind(this.queryService);
    this.getProjectUsers = this.queryService.getProjectUsers.bind(this.queryService);
    this.getUserProjects = this.queryService.getUserProjects.bind(this.queryService);
  }
}