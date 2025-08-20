/**
 * Project Creation Service
 * Handles project creation with all related entities
 */

import { BaseService } from '@/core/services/BaseService';
import { Project, ProjectType } from '@/shared/types/project';
import { DbResponse, ProjectAssignment } from '@/core/database/types';
import { Schedule, Task, TaskType } from '@/shared/types/schedule';
import { ProjectWithRelations, CreateProjectData } from '@/core/services/project/types';
import { ProjectCrudService } from '@/core/services/project/ProjectCrudService';
import { TaskService } from '@/core/services/TaskService';

export class ProjectCreationService extends BaseService<Project> {
  private projectCrud: ProjectCrudService;
  private taskService: TaskService;

  constructor() {
    super('projects');
    this.projectCrud = new ProjectCrudService();
    this.taskService = new TaskService();
  }

  /**
   * Create project with relations
   */
  async createWithRelations(data: CreateProjectData): Promise<DbResponse<ProjectWithRelations>> {
    const db = this.getDatabase();
    
    // Create the project first
    const projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
      ...data,
      scheduleId: '', // Will be set after schedule creation
    };
    
    const projectResult = await this.projectCrud.create(projectData);
    if (!projectResult.success || !projectResult.data) {
      return projectResult as DbResponse<ProjectWithRelations>;
    }
    
    const project = projectResult.data;
    
    // Create schedule for the project with same ID as project
    const scheduleId = project.id; // Use project ID as schedule ID
    const schedule: Schedule = {
      id: scheduleId,
      projectId: project.id,
      name: `${project.name} Schedule`,
      startDate: project.startDate,
      endDate: project.endDate,
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    db.schedules.set(scheduleId, schedule);
    
    // Update project with scheduleId
    await this.projectCrud.update(project.id, { scheduleId });
    
    // Create project assignments
    if (data.assignedUsers && data.assignedUsers.length > 0) {
      for (const assignment of data.assignedUsers) {
        const assignmentId = this.generateId();
        const projectAssignment: ProjectAssignment = {
          id: assignmentId,
          projectId: project.id,
          userId: assignment.userId,
          role: assignment.role,
          assignedAt: new Date(),
        };
        db.projectAssignments.set(assignmentId, projectAssignment);
      }
    }
    
    // Create initial tasks for the project
    if (project.type === ProjectType.SUB) {
      await this.createInitialTasks(project, scheduleId);
    }
    
    // Return project with relations
    const result = await this.getByIdWithRelations(project.id);
    return result;
  }

  /**
   * Create initial tasks for a sub project
   */
  private async createInitialTasks(project: Project, scheduleId: string): Promise<void> {
    const db = this.getDatabase();
    
    // Define task types based on factory types
    const tasksByFactory = {
      manufacturing: [TaskType.SOURCING, TaskType.PRODUCTION, TaskType.QUALITY_CHECK],
      container: [TaskType.CONTAINER_PRODUCTION, TaskType.CONTAINER_QUALITY_CHECK],
      packaging: [TaskType.PACKING_DESIGN, TaskType.PACKAGING, TaskType.DELIVERY],
    };
    
    let taskOrder = 0;
    
    // Create tasks for manufacturing factories
    if (project.manufacturerId) {
      const factoryIds = Array.isArray(project.manufacturerId) ? project.manufacturerId : [project.manufacturerId];
      for (const factoryId of factoryIds) {
        const factory = db.factories.get(factoryId);
        if (factory) {
          for (const taskType of tasksByFactory.manufacturing) {
            await this.taskService.create({
              scheduleId,
              projectId: project.id,
              factoryId,
              taskType,
              title: `${taskType} - ${factory.name}`,
              plannedStartDate: project.startDate,
              plannedEndDate: project.endDate,
              order: taskOrder++,
              status: 'todo',
              progress: 0,
            });
          }
        }
      }
    }
    
    // Create tasks for container factories
    if (project.containerId) {
      const factoryIds = Array.isArray(project.containerId) ? project.containerId : [project.containerId];
      for (const factoryId of factoryIds) {
        const factory = db.factories.get(factoryId);
        if (factory) {
          for (const taskType of tasksByFactory.container) {
            await this.taskService.create({
              scheduleId,
              projectId: project.id,
              factoryId,
              taskType,
              title: `${taskType} - ${factory.name}`,
              plannedStartDate: project.startDate,
              plannedEndDate: project.endDate,
              order: taskOrder++,
              status: 'todo',
              progress: 0,
            });
          }
        }
      }
    }
    
    // Create tasks for packaging factories
    if (project.packagingId) {
      const factoryIds = Array.isArray(project.packagingId) ? project.packagingId : [project.packagingId];
      for (const factoryId of factoryIds) {
        const factory = db.factories.get(factoryId);
        if (factory) {
          for (const taskType of tasksByFactory.packaging) {
            await this.taskService.create({
              scheduleId,
              projectId: project.id,
              factoryId,
              taskType,
              title: `${taskType} - ${factory.name}`,
              plannedStartDate: project.startDate,
              plannedEndDate: project.endDate,
              order: taskOrder++,
              status: 'todo',
              progress: 0,
            });
          }
        }
      }
    }
  }

  /**
   * Get project by ID with all relations (stub - will be implemented in query service)
   */
  private async getByIdWithRelations(projectId: string): Promise<DbResponse<ProjectWithRelations>> {
    // This will be properly implemented in ProjectQueryService
    const project = this.getDatabase().projects.get(projectId);
    if (!project) {
      return {
        success: false,
        error: 'Project not found',
      };
    }
    
    return {
      success: true,
      data: project as ProjectWithRelations,
    };
  }
}