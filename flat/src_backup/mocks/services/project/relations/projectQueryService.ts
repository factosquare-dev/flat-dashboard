/**
 * Project Query Service
 * Handles project queries with relations
 */

import { BaseService } from '@/mocks/services/BaseService';
import { Project } from '@/types/project';
import { DbResponse } from '@/mocks/database/types';
import { User } from '@/types/user';
import { Factory } from '@/types/factory';
import { Schedule, Task } from '@/types/schedule';
import type { Comment } from '@/types/comment';
import { ProjectWithRelations } from '@/mocks/services/types';

export class ProjectQueryService extends BaseService<Project> {
  constructor() {
    super('projects');
  }

  /**
   * Get project by ID with all relations
   */
  async getByIdWithRelations(projectId: string): Promise<DbResponse<ProjectWithRelations>> {
    const db = this.getDatabase();
    const project = db.projects.get(projectId);
    
    if (!project) {
      return {
        success: false,
        error: 'Project not found',
      };
    }
    
    // Get assigned users
    const assignedUsers: Array<User & { role: string; assignedAt: Date }> = [];
    for (const [, assignment] of db.projectAssignments) {
      if (assignment.projectId === projectId) {
        const user = db.users.get(assignment.userId);
        if (user) {
          assignedUsers.push({
            ...user,
            role: assignment.role,
            assignedAt: assignment.assignedAt,
          });
        }
      }
    }
    
    // Get factories
    const factories: Factory[] = [];
    
    // Manufacturing factories
    if (project.manufacturerId) {
      const ids = Array.isArray(project.manufacturerId) ? project.manufacturerId : [project.manufacturerId];
      for (const id of ids) {
        const factory = db.factories.get(id);
        if (factory) factories.push(factory);
      }
    }
    
    // Container factories
    if (project.containerId) {
      const ids = Array.isArray(project.containerId) ? project.containerId : [project.containerId];
      for (const id of ids) {
        const factory = db.factories.get(id);
        if (factory) factories.push(factory);
      }
    }
    
    // Packaging factories
    if (project.packagingId) {
      const ids = Array.isArray(project.packagingId) ? project.packagingId : [project.packagingId];
      for (const id of ids) {
        const factory = db.factories.get(id);
        if (factory) factories.push(factory);
      }
    }
    
    // Get schedule and tasks
    const schedule = project.scheduleId ? db.schedules.get(project.scheduleId) : null;
    const tasks: Task[] = [];
    if (schedule) {
      for (const [, task] of db.tasks) {
        if (task.scheduleId === schedule.id) {
          tasks.push(task);
        }
      }
    }
    
    // Get comments
    const comments: Comment[] = [];
    for (const [, comment] of db.comments) {
      if (comment.projectId === projectId) {
        comments.push(comment);
      }
    }
    
    // Get customer and related manager
    const customer = project.customerId ? db.customers.get(project.customerId) : null;
    let customerManager: User | null = null;
    
    if (customer && customer.managerId) {
      customerManager = db.users.get(customer.managerId) || null;
    }
    
    const projectWithRelations: ProjectWithRelations = {
      ...project,
      assignedUsers,
      factories,
      schedule: schedule ? { ...schedule, tasks } : null,
      comments,
      customer: customer || undefined,
      customerManager: customerManager || undefined,
    };
    
    return {
      success: true,
      data: projectWithRelations,
    };
  }

  /**
   * Get project users with their roles
   */
  async getProjectUsers(projectId: string): Promise<DbResponse<Array<User & { role: string; assignedAt: Date }>>> {
    const db = this.getDatabase();
    const project = db.projects.get(projectId);
    
    if (!project) {
      return {
        success: false,
        error: 'Project not found',
      };
    }
    
    const users: Array<User & { role: string; assignedAt: Date }> = [];
    
    // Get assigned users from project assignments
    for (const [, assignment] of db.projectAssignments) {
      if (assignment.projectId === projectId) {
        const user = db.users.get(assignment.userId);
        if (user) {
          users.push({
            ...user,
            role: assignment.role,
            assignedAt: assignment.assignedAt,
          });
        }
      }
    }
    
    return {
      success: true,
      data: users,
    };
  }

  /**
   * Get all projects for a specific user
   */
  async getUserProjects(userId: string, role?: 'manager' | 'member' | 'viewer'): Promise<DbResponse<Project[]>> {
    const db = this.getDatabase();
    const user = db.users.get(userId);
    
    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }
    
    const userProjects: Project[] = [];
    
    // Get projects from project assignments
    for (const [, assignment] of db.projectAssignments) {
      if (assignment.userId === userId && (!role || assignment.role === role)) {
        const project = db.projects.get(assignment.projectId);
        if (project) {
          userProjects.push(project);
        }
      }
    }
    
    return {
      success: true,
      data: userProjects,
    };
  }
}