/**
 * Project Relations Service
 * Handles project relationships with users, factories, schedules, tasks, etc.
 */

import { BaseService } from '../BaseService';
import { Project, ProjectType } from '@/types/project';
import { DbResponse, ProjectAssignment } from '../../database/types';
import { User } from '@/types/user';
import { Factory } from '@/types/factory';
import { Schedule, Task, TaskType } from '@/types/schedule';
import type { Comment } from '@/types/comment';
import { ProjectWithRelations, CreateProjectData } from './types';
import { ProjectCrudService } from './ProjectCrudService';

export class ProjectRelationsService extends BaseService<Project> {
  private projectCrud: ProjectCrudService;

  constructor() {
    super('projects');
    this.projectCrud = new ProjectCrudService();
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
    
    // Create schedule for the project
    const scheduleId = this.generateId();
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
    
    // Get the created project with relations
    return this.getByIdWithRelations(project.id);
  }

  /**
   * Get project with all relations
   */
  async getByIdWithRelations(projectId: string): Promise<DbResponse<ProjectWithRelations>> {
    const projectResult = await this.projectCrud.getById(projectId);
    if (!projectResult.success || !projectResult.data) {
      return projectResult as DbResponse<ProjectWithRelations>;
    }
    
    const project = projectResult.data;
    const projectWithRelations: ProjectWithRelations = { ...project };
    
    // Get users
    const usersResult = await this.getProjectUsers(projectId);
    if (usersResult.success && usersResult.data) {
      projectWithRelations.users = usersResult.data;
    }
    
    // Get factories
    const factoriesResult = await this.getProjectFactories(project);
    if (factoriesResult.success && factoriesResult.data) {
      projectWithRelations.factories = factoriesResult.data;
    }
    
    // Get schedule
    if (project.scheduleId) {
      const scheduleResult = await this.getProjectSchedule(project.scheduleId);
      if (scheduleResult.success && scheduleResult.data) {
        projectWithRelations.schedule = scheduleResult.data;
        
        // Get tasks
        const tasksResult = await this.getProjectTasks(project.scheduleId);
        if (tasksResult.success && tasksResult.data) {
          projectWithRelations.tasks = tasksResult.data;
        }
      }
    }
    
    // Get comments
    const commentsResult = await this.getProjectComments(projectId);
    if (commentsResult.success && commentsResult.data) {
      projectWithRelations.comments = commentsResult.data;
    }
    
    // Get sub projects or parent project
    if (project.type === ProjectType.MASTER) {
      const subProjectsResult = await this.getSubProjects(projectId);
      if (subProjectsResult.success && subProjectsResult.data) {
        projectWithRelations.subProjects = subProjectsResult.data;
      }
    } else if (project.type === ProjectType.SUB && project.parentId) {
      const parentResult = await this.projectCrud.getById(project.parentId);
      if (parentResult.success && parentResult.data) {
        projectWithRelations.parentProject = parentResult.data;
      }
    }
    
    return {
      success: true,
      data: projectWithRelations,
    };
  }

  /**
   * Get project users with roles
   */
  async getProjectUsers(projectId: string): Promise<DbResponse<Array<User & { role: string; assignedAt: Date }>>> {
    const db = this.getDatabase();
    
    const assignments = Array.from(db.projectAssignments.values())
      .filter(pa => pa.projectId === projectId);
    
    const usersWithRoles: Array<User & { role: string; assignedAt: Date }> = [];
    
    for (const assignment of assignments) {
      const user = db.users.get(assignment.userId);
      if (user) {
        usersWithRoles.push({
          ...user,
          role: assignment.role,
          assignedAt: assignment.assignedAt,
        });
      }
    }
    
    return {
      success: true,
      data: usersWithRoles,
    };
  }

  /**
   * Get project factories
   */
  private async getProjectFactories(project: Project): Promise<DbResponse<ProjectWithRelations['factories']>> {
    const db = this.getDatabase();
    const factories: ProjectWithRelations['factories'] = {};
    
    if (project.manufacturerId) {
      const factory = db.factories.get(project.manufacturerId);
      if (factory) {
        factories.manufacturer = factory;
      }
    }
    
    if (project.containerId) {
      const factory = db.factories.get(project.containerId);
      if (factory) {
        factories.container = factory;
      }
    }
    
    if (project.packagingId) {
      const factory = db.factories.get(project.packagingId);
      if (factory) {
        factories.packaging = factory;
      }
    }
    
    return {
      success: true,
      data: factories,
    };
  }

  /**
   * Get project schedule
   */
  private async getProjectSchedule(scheduleId: string): Promise<DbResponse<Schedule | undefined>> {
    const db = this.getDatabase();
    const schedule = db.schedules.get(scheduleId);
    
    return {
      success: true,
      data: schedule,
    };
  }

  /**
   * Get project tasks
   */
  private async getProjectTasks(scheduleId: string): Promise<DbResponse<Task[]>> {
    const db = this.getDatabase();
    
    const tasks = Array.from(db.tasks.values())
      .filter(task => task.scheduleId === scheduleId)
      .sort((a, b) => {
        // Sort by start date
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();
        return dateA - dateB;
      });
    
    return {
      success: true,
      data: tasks,
    };
  }

  /**
   * Get project comments
   */
  private async getProjectComments(projectId: string): Promise<DbResponse<Comment[]>> {
    const db = this.getDatabase();
    
    const comments = Array.from(db.comments.values())
      .filter(comment => 
        comment.entityType === 'project' && 
        comment.entityId === projectId
      )
      .sort((a, b) => {
        // Sort by creation date, newest first
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
    
    return {
      success: true,
      data: comments,
    };
  }

  /**
   * Get sub projects of a master project
   */
  private async getSubProjects(parentId: string): Promise<DbResponse<Project[]>> {
    const db = this.getDatabase();
    
    const subProjects = Array.from(db.projects.values())
      .filter(project => 
        project.type === ProjectType.SUB && 
        project.parentId === parentId
      )
      .sort((a, b) => {
        // Sort by creation date
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
    
    return {
      success: true,
      data: subProjects,
    };
  }

  /**
   * Create initial tasks for a project
   */
  private async createInitialTasks(project: Project, scheduleId: string): Promise<void> {
    const db = this.getDatabase();
    
    // Define initial task types based on project type
    const taskTypes: Array<{ type: TaskType; name: string; durationDays: number; order: number }> = [
      { type: TaskType.PLANNING, name: '기획 및 디자인', durationDays: 7, order: 1 },
      { type: TaskType.RAW_MATERIAL, name: '원료 수급', durationDays: 14, order: 2 },
      { type: TaskType.PRODUCTION, name: '생산', durationDays: 21, order: 3 },
      { type: TaskType.QUALITY_CHECK, name: '품질 검사', durationDays: 7, order: 4 },
      { type: TaskType.PACKAGING, name: '포장', durationDays: 7, order: 5 },
      { type: TaskType.DELIVERY, name: '납품', durationDays: 3, order: 6 },
    ];
    
    const projectStart = new Date(project.startDate);
    const projectEnd = new Date(project.endDate);
    const totalDays = Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
    
    let currentDate = new Date(projectStart);
    
    for (const taskType of taskTypes) {
      const taskId = this.generateId();
      
      // Calculate task duration proportionally
      const taskDuration = Math.max(1, Math.floor((taskType.durationDays / 59) * totalDays));
      const taskEndDate = new Date(currentDate);
      taskEndDate.setDate(taskEndDate.getDate() + taskDuration - 1);
      
      // Ensure task doesn't exceed project end date
      if (taskEndDate > projectEnd) {
        taskEndDate.setTime(projectEnd.getTime());
      }
      
      const task: Task = {
        id: taskId,
        scheduleId,
        name: taskType.name,
        type: taskType.type,
        startDate: new Date(currentDate),
        endDate: new Date(taskEndDate),
        status: 'pending',
        progress: 0,
        dependencies: [],
        assignedTo: [],
        description: `${project.name}의 ${taskType.name} 작업`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Add factory assignment based on task type
      if (taskType.type === TaskType.PRODUCTION && project.manufacturerId) {
        task.factory = project.manufacturerId;
      } else if (taskType.type === TaskType.PACKAGING && project.packagingId) {
        task.factory = project.packagingId;
      }
      
      db.tasks.set(taskId, task);
      
      // Move to next task start date
      currentDate = new Date(taskEndDate);
      currentDate.setDate(currentDate.getDate() + 1);
      
      // Ensure we don't exceed project end date
      if (currentDate >= projectEnd) {
        break;
      }
    }
  }

  /**
   * Get projects by user
   */
  async getUserProjects(userId: string, role?: 'manager' | 'member' | 'viewer'): Promise<DbResponse<Project[]>> {
    const db = this.getDatabase();
    
    const assignments = Array.from(db.projectAssignments.values())
      .filter(pa => {
        if (role) {
          return pa.userId === userId && pa.role === role;
        }
        return pa.userId === userId;
      });
    
    const projects: Project[] = [];
    
    for (const assignment of assignments) {
      const project = db.projects.get(assignment.projectId);
      if (project) {
        projects.push(project);
      }
    }
    
    // Sort by creation date, newest first
    projects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return {
      success: true,
      data: projects,
    };
  }
}