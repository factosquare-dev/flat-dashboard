/**
 * Project Service
 * Handles project-related operations with comprehensive relationship management
 */

import { BaseService } from './BaseService';
import { Project, ProjectType, ProjectStatus } from '@/types/project';
import { DbResponse, ProjectAssignment, FactoryProject } from '../database/types';
import { User } from '@/types/user';
import { Factory } from '@/types/factory';
import { Schedule, Task } from '@/types/schedule';
import { Comment } from '@/types/comment';

export interface ProjectWithRelations extends Project {
  users?: Array<User & { role: string; assignedAt: Date }>;
  factories?: {
    manufacturer?: Factory;
    container?: Factory;
    packaging?: Factory;
  };
  schedule?: Schedule;
  tasks?: Task[];
  comments?: Comment[];
  subProjects?: Project[];
  parentProject?: Project;
}

export interface CreateProjectData extends Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'scheduleId'> {
  assignedUsers?: Array<{ userId: string; role: 'manager' | 'member' | 'viewer' }>;
}

export class ProjectService extends BaseService<Project> {
  constructor() {
    super('projects');
  }

  /**
   * Create project with all relationships
   */
  async createWithRelations(data: CreateProjectData): Promise<DbResponse<ProjectWithRelations>> {
    try {
      // Create schedule first
      const scheduleId = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const schedule: Schedule = {
        id: scheduleId,
        projectId: '', // Will be updated
        startDate: data.startDate,
        endDate: data.endDate,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create project
      const projectData = { ...data, scheduleId };
      delete (projectData as any).assignedUsers;
      
      const projectResult = await this.create(projectData);
      if (!projectResult.success || !projectResult.data) {
        return projectResult;
      }

      const project = projectResult.data;

      // Update schedule with project ID
      schedule.projectId = project.id;
      await this.db.create('schedules', scheduleId, schedule);

      // Create factory relationships
      await this.assignFactoriesToProject(project);

      // Assign users
      if (data.assignedUsers) {
        for (const assignment of data.assignedUsers) {
          await this.assignUserToProject(
            project.id,
            assignment.userId,
            assignment.role,
            data.createdBy
          );
        }
      }

      // Create initial tasks
      await this.createInitialTasks(project, scheduleId);

      // Return with all relations
      return this.getByIdWithRelations(project.id);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create project',
      };
    }
  }

  /**
   * Get project with all relations
   */
  async getByIdWithRelations(projectId: string): Promise<DbResponse<ProjectWithRelations>> {
    const projectResult = await this.getById(projectId);
    if (!projectResult.success || !projectResult.data) {
      return projectResult;
    }

    const project = projectResult.data;
    
    // Get all related data in parallel
    const [users, factories, schedule, tasks, comments, subProjects, parentProject] = await Promise.all([
      this.getProjectUsers(projectId),
      this.getProjectFactories(project),
      this.getProjectSchedule(project.scheduleId),
      this.getProjectTasks(project.scheduleId),
      this.getProjectComments(projectId),
      this.getSubProjects(projectId),
      project.parentId ? this.getById(project.parentId) : Promise.resolve({ success: true, data: undefined }),
    ]);

    return {
      success: true,
      data: {
        ...project,
        users: users.data || [],
        factories: factories.data,
        schedule: schedule.data,
        tasks: tasks.data || [],
        comments: comments.data || [],
        subProjects: subProjects.data || [],
        parentProject: parentProject.data,
      },
    };
  }

  /**
   * Get project users with roles
   */
  async getProjectUsers(projectId: string): Promise<DbResponse<Array<User & { role: string; assignedAt: Date }>>> {
    try {
      const assignmentsResult = await this.db.getAll('projectAssignments');
      if (!assignmentsResult.success || !assignmentsResult.data) {
        return {
          success: false,
          error: assignmentsResult.error || 'Failed to fetch assignments',
        };
      }

      const projectAssignments = assignmentsResult.data.filter(
        (pa: ProjectAssignment) => pa.projectId === projectId
      );

      const users: Array<User & { role: string; assignedAt: Date }> = [];
      
      for (const assignment of projectAssignments) {
        const userResult = await this.db.get('users', assignment.userId);
        if (userResult.success && userResult.data) {
          users.push({
            ...(userResult.data as User),
            role: assignment.role,
            assignedAt: assignment.assignedAt,
          });
        }
      }

      return {
        success: true,
        data: users,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch project users',
      };
    }
  }

  /**
   * Get project factories
   */
  private async getProjectFactories(project: Project): Promise<DbResponse<ProjectWithRelations['factories']>> {
    try {
      const factories: ProjectWithRelations['factories'] = {};

      if (project.manufacturerId) {
        const result = await this.db.get('factories', project.manufacturerId);
        if (result.success && result.data) {
          factories.manufacturer = result.data as Factory;
        }
      }

      if (project.containerId) {
        const result = await this.db.get('factories', project.containerId);
        if (result.success && result.data) {
          factories.container = result.data as Factory;
        }
      }

      if (project.packagingId) {
        const result = await this.db.get('factories', project.packagingId);
        if (result.success && result.data) {
          factories.packaging = result.data as Factory;
        }
      }

      return {
        success: true,
        data: factories,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch project factories',
      };
    }
  }

  /**
   * Get project schedule
   */
  private async getProjectSchedule(scheduleId: string): Promise<DbResponse<Schedule | undefined>> {
    if (!scheduleId) {
      return { success: true, data: undefined };
    }

    const result = await this.db.get('schedules', scheduleId);
    return {
      success: result.success,
      data: result.data as Schedule | undefined,
      error: result.error,
    };
  }

  /**
   * Get project tasks
   */
  private async getProjectTasks(scheduleId: string): Promise<DbResponse<Task[]>> {
    if (!scheduleId) {
      return { success: true, data: [] };
    }

    try {
      const tasksResult = await this.db.getAll('tasks');
      if (!tasksResult.success || !tasksResult.data) {
        return {
          success: false,
          error: tasksResult.error || 'Failed to fetch tasks',
        };
      }

      const scheduleTasks = tasksResult.data.filter(
        (task: Task) => task.scheduleId === scheduleId
      );

      return {
        success: true,
        data: scheduleTasks,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch project tasks',
      };
    }
  }

  /**
   * Get project comments
   */
  private async getProjectComments(projectId: string): Promise<DbResponse<Comment[]>> {
    try {
      const commentsResult = await this.db.getAll('comments');
      if (!commentsResult.success || !commentsResult.data) {
        return {
          success: false,
          error: commentsResult.error || 'Failed to fetch comments',
        };
      }

      const projectComments = commentsResult.data.filter(
        (comment: Comment) => comment.projectId === projectId
      );

      return {
        success: true,
        data: projectComments.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch project comments',
      };
    }
  }

  /**
   * Get sub-projects
   */
  private async getSubProjects(parentId: string): Promise<DbResponse<Project[]>> {
    return this.find({ parentId });
  }

  /**
   * Assign factories to project
   */
  private async assignFactoriesToProject(project: Project): Promise<void> {
    const factoryAssignments = [
      { factoryId: project.manufacturerId, type: 'manufacturer' as const },
      { factoryId: project.containerId, type: 'container' as const },
      { factoryId: project.packagingId, type: 'packaging' as const },
    ];

    for (const assignment of factoryAssignments) {
      if (assignment.factoryId) {
        const relationId = `fp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const factoryProject: FactoryProject = {
          id: relationId,
          projectId: project.id,
          factoryId: assignment.factoryId,
          factoryType: assignment.type,
          isPrimary: assignment.type === 'manufacturer',
          assignedAt: new Date(),
        };
        
        await this.db.create('factoryProjects', relationId, factoryProject);
      }
    }
  }

  /**
   * Create initial tasks for project
   */
  private async createInitialTasks(project: Project, scheduleId: string): Promise<void> {
    const taskTemplates = [
      { title: '프로젝트 킥오프', type: 'planning', duration: 1 },
      { title: '요구사항 분석', type: 'planning', duration: 3 },
      { title: '디자인 검토', type: 'design', duration: 5 },
      { title: '원료 준비', type: 'material', duration: 7 },
      { title: '생산 준비', type: 'production', duration: 3 },
    ];

    let currentDate = new Date(project.startDate);
    
    for (const template of taskTemplates) {
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const endDate = new Date(currentDate);
      endDate.setDate(endDate.getDate() + template.duration);

      const task: Task = {
        id: taskId,
        scheduleId,
        title: `${template.title} - ${project.name}`,
        type: template.type as any,
        status: 'TODO',
        startDate: new Date(currentDate),
        endDate,
        progress: 0,
        participants: [],
        priority: project.priority,
        dependsOn: [],
        blockedBy: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.db.create('tasks', taskId, task);
      currentDate = new Date(endDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  /**
   * Assign user to project
   */
  async assignUserToProject(
    projectId: string,
    userId: string,
    role: 'manager' | 'member' | 'viewer',
    assignedBy: string
  ): Promise<DbResponse<ProjectAssignment>> {
    // Check if assignment already exists
    const existingResult = await this.db.getAll('projectAssignments');
    if (existingResult.success && existingResult.data) {
      const existing = existingResult.data.find(
        (pa: ProjectAssignment) => pa.projectId === projectId && pa.userId === userId
      );
      
      if (existing) {
        // Update role if different
        if (existing.role !== role) {
          return this.db.update('projectAssignments', existing.id, { role });
        }
        return {
          success: false,
          error: 'User already assigned to this project',
        };
      }
    }

    const assignmentId = `pa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const projectAssignment: ProjectAssignment = {
      id: assignmentId,
      projectId,
      userId,
      role,
      assignedAt: new Date(),
      assignedBy,
    };

    return this.db.create('projectAssignments', assignmentId, projectAssignment);
  }

  /**
   * Remove user from project
   */
  async removeUserFromProject(projectId: string, userId: string): Promise<DbResponse<void>> {
    const assignmentsResult = await this.db.getAll('projectAssignments');
    if (!assignmentsResult.success || !assignmentsResult.data) {
      return {
        success: false,
        error: assignmentsResult.error || 'Failed to fetch assignments',
      };
    }

    const assignment = assignmentsResult.data.find(
      (pa: ProjectAssignment) => pa.projectId === projectId && pa.userId === userId
    );

    if (!assignment) {
      return {
        success: false,
        error: 'User not assigned to this project',
      };
    }

    return this.db.delete('projectAssignments', assignment.id);
  }

  /**
   * Update project status
   */
  async updateStatus(projectId: string, status: ProjectStatus): Promise<DbResponse<Project>> {
    const project = await this.getById(projectId);
    if (!project.success || !project.data) {
      return project;
    }

    // Update schedule status accordingly
    if (project.data.scheduleId) {
      let scheduleStatus: Schedule['status'] = 'draft';
      if (status === ProjectStatus.IN_PROGRESS) {
        scheduleStatus = 'active';
      } else if (status === ProjectStatus.COMPLETED) {
        scheduleStatus = 'completed';
      }

      await this.db.update('schedules', project.data.scheduleId, { status: scheduleStatus });
    }

    return this.update(projectId, { status });
  }

  /**
   * Update project progress
   */
  async updateProgress(projectId: string, progress: number): Promise<DbResponse<Project>> {
    if (progress < 0 || progress > 100) {
      return {
        success: false,
        error: 'Progress must be between 0 and 100',
      };
    }

    const result = await this.update(projectId, { progress });
    
    // Auto-update status based on progress
    if (result.success && result.data) {
      if (progress === 100 && result.data.status !== ProjectStatus.COMPLETED) {
        await this.updateStatus(projectId, ProjectStatus.COMPLETED);
      } else if (progress > 0 && progress < 100 && result.data.status === ProjectStatus.PLANNING) {
        await this.updateStatus(projectId, ProjectStatus.IN_PROGRESS);
      }
    }

    return result;
  }

  /**
   * Add comment to project
   */
  async addComment(projectId: string, userId: string, content: string): Promise<DbResponse<Comment>> {
    const userResult = await this.db.get('users', userId);
    if (!userResult.success || !userResult.data) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    const user = userResult.data as User;
    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const comment: Comment = {
      id: commentId,
      projectId,
      userId,
      author: {
        id: user.id,
        name: user.name,
        profileImage: user.profileImage,
      },
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.db.create('comments', commentId, comment);
  }

  /**
   * Get projects by status
   */
  async getByStatus(status: ProjectStatus): Promise<DbResponse<Project[]>> {
    return this.find({ status });
  }

  /**
   * Get projects by customer
   */
  async getByCustomer(customerId: string): Promise<DbResponse<Project[]>> {
    try {
      const allProjectsResult = await this.getAll();
      if (!allProjectsResult.success || !allProjectsResult.data) {
        return allProjectsResult;
      }

      const customerProjects = allProjectsResult.data.filter(
        project => project.customer.id === customerId
      );

      return {
        success: true,
        data: customerProjects,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch customer projects',
      };
    }
  }

  /**
   * Get user's projects
   */
  async getUserProjects(userId: string, role?: 'manager' | 'member' | 'viewer'): Promise<DbResponse<Project[]>> {
    try {
      const assignmentsResult = await this.db.getAll('projectAssignments');
      if (!assignmentsResult.success || !assignmentsResult.data) {
        return {
          success: false,
          error: assignmentsResult.error || 'Failed to fetch assignments',
        };
      }

      let userAssignments = assignmentsResult.data.filter(
        (pa: ProjectAssignment) => pa.userId === userId
      );

      if (role) {
        userAssignments = userAssignments.filter((pa: ProjectAssignment) => pa.role === role);
      }

      const projects: Project[] = [];
      
      for (const assignment of userAssignments) {
        const projectResult = await this.getById(assignment.projectId);
        if (projectResult.success && projectResult.data) {
          projects.push(projectResult.data);
        }
      }

      return {
        success: true,
        data: projects,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user projects',
      };
    }
  }

  /**
   * Delete project (with cascade)
   */
  async delete(projectId: string): Promise<DbResponse<void>> {
    // Check for sub-projects
    const subProjectsResult = await this.getSubProjects(projectId);
    if (subProjectsResult.success && subProjectsResult.data && subProjectsResult.data.length > 0) {
      return {
        success: false,
        error: 'Cannot delete project with sub-projects',
      };
    }

    // Get project details
    const projectResult = await this.getById(projectId);
    if (!projectResult.success || !projectResult.data) {
      return projectResult as DbResponse<void>;
    }

    const project = projectResult.data;

    // Delete schedule and tasks
    if (project.scheduleId) {
      // Delete tasks first
      const tasksResult = await this.getProjectTasks(project.scheduleId);
      if (tasksResult.success && tasksResult.data) {
        for (const task of tasksResult.data) {
          await this.db.delete('tasks', task.id);
        }
      }
      
      // Delete schedule
      await this.db.delete('schedules', project.scheduleId);
    }

    // Delete comments
    const commentsResult = await this.getProjectComments(projectId);
    if (commentsResult.success && commentsResult.data) {
      for (const comment of commentsResult.data) {
        await this.db.delete('comments', comment.id);
      }
    }

    // Delete project assignments
    const assignmentsResult = await this.db.getAll('projectAssignments');
    if (assignmentsResult.success && assignmentsResult.data) {
      const projectAssignments = assignmentsResult.data.filter(
        (pa: ProjectAssignment) => pa.projectId === projectId
      );
      
      for (const assignment of projectAssignments) {
        await this.db.delete('projectAssignments', assignment.id);
      }
    }

    // Delete factory-project relations
    const factoryRelationsResult = await this.db.getAll('factoryProjects');
    if (factoryRelationsResult.success && factoryRelationsResult.data) {
      const projectRelations = factoryRelationsResult.data.filter(
        (fp: FactoryProject) => fp.projectId === projectId
      );
      
      for (const relation of projectRelations) {
        await this.db.delete('factoryProjects', relation.id);
      }
    }

    // Delete the project
    return super.delete(projectId);
  }
}