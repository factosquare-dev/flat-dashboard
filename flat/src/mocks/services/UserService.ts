/**
 * User Service
 * Handles user-related operations with factory and project relationships
 */

import { BaseService } from './BaseService';
import { User, UserRole } from '@/types/user';
import { DbResponse, UserFactory, ProjectAssignment } from '../database/types';
import { Factory } from '@/types/factory';
import { Project } from '@/types/project';

export interface UserWithRelations extends User {
  factories?: Array<Factory & { role: string }>;
  projects?: Array<Project & { role: string }>;
}

export class UserService extends BaseService<User> {
  constructor() {
    super('users');
  }

  /**
   * Create user with initial factory assignments
   */
  async createWithFactories(
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
    factoryIds: string[],
    role: 'manager' | 'operator' | 'viewer' = 'viewer'
  ): Promise<DbResponse<UserWithRelations>> {
    // Create user first
    const userResult = await this.create(userData);
    if (!userResult.success || !userResult.data) {
      return userResult;
    }

    const user = userResult.data;
    const factories: Array<Factory & { role: string }> = [];

    // Assign factories
    for (const factoryId of factoryIds) {
      const factoryResult = await this.db.get('factories', factoryId);
      if (factoryResult.success && factoryResult.data) {
        const relationId = `uf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const userFactory: UserFactory = {
          id: relationId,
          userId: user.id,
          factoryId,
          role,
          assignedAt: new Date(),
          assignedBy: 'system', // In real app, this would be current user
        };

        await this.db.create('userFactories', relationId, userFactory);
        factories.push({ ...(factoryResult.data as Factory), role });
      }
    }

    return {
      success: true,
      data: { ...user, factories },
    };
  }

  /**
   * Get user with all relations
   */
  async getByIdWithRelations(userId: string): Promise<DbResponse<UserWithRelations>> {
    const userResult = await this.getById(userId);
    if (!userResult.success || !userResult.data) {
      return userResult;
    }

    const user = userResult.data;
    
    // Get factories
    const factories = await this.getUserFactories(userId);
    
    // Get projects
    const projects = await this.getUserProjects(userId);

    return {
      success: true,
      data: {
        ...user,
        factories: factories.data || [],
        projects: projects.data || [],
      },
    };
  }

  /**
   * Get user's factories with roles
   */
  async getUserFactories(userId: string): Promise<DbResponse<Array<Factory & { role: string }>>> {
    try {
      // Get user-factory relations
      const relationsResult = await this.db.getAll('userFactories');
      if (!relationsResult.success || !relationsResult.data) {
        return {
          success: false,
          error: relationsResult.error || 'Failed to fetch relations',
        };
      }

      const userRelations = relationsResult.data.filter(
        (uf: UserFactory) => uf.userId === userId
      );

      // Get factory details
      const factories: Array<Factory & { role: string }> = [];
      
      for (const relation of userRelations) {
        const factoryResult = await this.db.get('factories', relation.factoryId);
        if (factoryResult.success && factoryResult.data) {
          factories.push({
            ...(factoryResult.data as Factory),
            role: relation.role,
          });
        }
      }

      return {
        success: true,
        data: factories,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user factories',
      };
    }
  }

  /**
   * Get user's projects with roles
   */
  async getUserProjects(userId: string): Promise<DbResponse<Array<Project & { role: string }>>> {
    try {
      // Get project assignments
      const assignmentsResult = await this.db.getAll('projectAssignments');
      if (!assignmentsResult.success || !assignmentsResult.data) {
        return {
          success: false,
          error: assignmentsResult.error || 'Failed to fetch assignments',
        };
      }

      const userAssignments = assignmentsResult.data.filter(
        (pa: ProjectAssignment) => pa.userId === userId
      );

      // Get project details
      const projects: Array<Project & { role: string }> = [];
      
      for (const assignment of userAssignments) {
        const projectResult = await this.db.get('projects', assignment.projectId);
        if (projectResult.success && projectResult.data) {
          projects.push({
            ...(projectResult.data as Project),
            role: assignment.role,
          });
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
   * Assign user to factory
   */
  async assignToFactory(
    userId: string,
    factoryId: string,
    role: 'manager' | 'operator' | 'viewer',
    assignedBy: string
  ): Promise<DbResponse<UserFactory>> {
    // Check if assignment already exists
    const existingResult = await this.db.getAll('userFactories');
    if (existingResult.success && existingResult.data) {
      const existing = existingResult.data.find(
        (uf: UserFactory) => uf.userId === userId && uf.factoryId === factoryId
      );
      
      if (existing) {
        return {
          success: false,
          error: 'User already assigned to this factory',
        };
      }
    }

    const relationId = `uf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userFactory: UserFactory = {
      id: relationId,
      userId,
      factoryId,
      role,
      assignedAt: new Date(),
      assignedBy,
    };

    return this.db.create('userFactories', relationId, userFactory);
  }

  /**
   * Remove user from factory
   */
  async removeFromFactory(userId: string, factoryId: string): Promise<DbResponse<void>> {
    const relationsResult = await this.db.getAll('userFactories');
    if (!relationsResult.success || !relationsResult.data) {
      return {
        success: false,
        error: relationsResult.error || 'Failed to fetch relations',
      };
    }

    const relation = relationsResult.data.find(
      (uf: UserFactory) => uf.userId === userId && uf.factoryId === factoryId
    );

    if (!relation) {
      return {
        success: false,
        error: 'User not assigned to this factory',
      };
    }

    return this.db.delete('userFactories', relation.id);
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: UserRole): Promise<DbResponse<User[]>> {
    return this.find({ role });
  }

  /**
   * Update user permissions
   */
  async updatePermissions(userId: string, permissions: string[]): Promise<DbResponse<User>> {
    return this.update(userId, { permissions });
  }

  /**
   * Authenticate user (mock)
   */
  async authenticate(username: string, password: string): Promise<DbResponse<User>> {
    // In a real app, this would check password hash
    const userResult = await this.findOne({ username });
    
    if (!userResult.success || !userResult.data) {
      return {
        success: false,
        error: 'Invalid credentials',
      };
    }

    // Update last login
    await this.update(userResult.data.id, {
      lastLoginAt: new Date(),
    });

    return {
      success: true,
      data: userResult.data,
    };
  }

  /**
   * Get team members for a factory
   */
  async getFactoryTeam(factoryId: string): Promise<DbResponse<UserWithRelations[]>> {
    try {
      const relationsResult = await this.db.getAll('userFactories');
      if (!relationsResult.success || !relationsResult.data) {
        return {
          success: false,
          error: relationsResult.error || 'Failed to fetch relations',
        };
      }

      const factoryRelations = relationsResult.data.filter(
        (uf: UserFactory) => uf.factoryId === factoryId
      );

      const team: UserWithRelations[] = [];
      
      for (const relation of factoryRelations) {
        const userResult = await this.getByIdWithRelations(relation.userId);
        if (userResult.success && userResult.data) {
          team.push(userResult.data);
        }
      }

      return {
        success: true,
        data: team,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch factory team',
      };
    }
  }

  /**
   * Delete user (with cascade)
   */
  async delete(userId: string): Promise<DbResponse<void>> {
    // Remove all factory relations
    const factoryRelations = await this.db.getAll('userFactories');
    if (factoryRelations.success && factoryRelations.data) {
      const userRelations = factoryRelations.data.filter(
        (uf: UserFactory) => uf.userId === userId
      );
      
      for (const relation of userRelations) {
        await this.db.delete('userFactories', relation.id);
      }
    }

    // Remove all project assignments
    const projectAssignments = await this.db.getAll('projectAssignments');
    if (projectAssignments.success && projectAssignments.data) {
      const userAssignments = projectAssignments.data.filter(
        (pa: ProjectAssignment) => pa.userId === userId
      );
      
      for (const assignment of userAssignments) {
        await this.db.delete('projectAssignments', assignment.id);
      }
    }

    // Delete the user
    return super.delete(userId);
  }
}