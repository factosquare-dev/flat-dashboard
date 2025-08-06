/**
 * Factory Relations Service
 * Handles factory relationships with users and projects
 */

import { MockDatabaseImpl } from '../../database/MockDatabase';
import { DbResponse, UserFactory, FactoryProject } from '../../database/types';
import { User } from '@/types/user';
import { Project, ProjectStatus } from '@/types/project';

export class FactoryRelationsService {
  private db = MockDatabaseImpl.getInstance();

  /**
   * Get factory users with roles
   */
  async getFactoryUsers(factoryId: string): Promise<DbResponse<Array<User & { role: string }>>> {
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

      const users: Array<User & { role: string }> = [];
      
      for (const relation of factoryRelations) {
        const userResult = await this.db.get('users', relation.userId);
        if (userResult.success && userResult.data) {
          users.push({
            ...(userResult.data as User),
            role: relation.role,
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
        error: error instanceof Error ? error.message : 'Failed to fetch factory users',
      };
    }
  }

  /**
   * Get factory projects with factory type
   */
  async getFactoryProjects(factoryId: string): Promise<DbResponse<Array<Project & { factoryType: string }>>> {
    try {
      const relationsResult = await this.db.getAll('factoryProjects');
      if (!relationsResult.success || !relationsResult.data) {
        return {
          success: false,
          error: relationsResult.error || 'Failed to fetch relations',
        };
      }

      const factoryRelations = relationsResult.data.filter(
        (fp: FactoryProject) => fp.factoryId === factoryId
      );

      const projects: Array<Project & { factoryType: string }> = [];
      
      for (const relation of factoryRelations) {
        const projectResult = await this.db.get('projects', relation.projectId);
        if (projectResult.success && projectResult.data) {
          projects.push({
            ...(projectResult.data as Project),
            factoryType: relation.factoryType,
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
        error: error instanceof Error ? error.message : 'Failed to fetch factory projects',
      };
    }
  }

  /**
   * Assign user to factory
   */
  async assignUser(factoryId: string, userId: string, role: string = 'operator'): Promise<DbResponse<UserFactory>> {
    try {
      // Check if relation already exists
      const existingResult = await this.db.getAll('userFactories');
      if (existingResult.success && existingResult.data) {
        const existing = existingResult.data.find(
          (uf: UserFactory) => uf.factoryId === factoryId && uf.userId === userId
        );
        
        if (existing) {
          // Update role if different
          if (existing.role !== role) {
            existing.role = role;
            existing.updatedAt = new Date();
            return await this.db.update('userFactories', existing.id, existing);
          }
          return {
            success: true,
            data: existing,
          };
        }
      }

      // Create new relation
      const newRelation: Omit<UserFactory, 'id'> = {
        userId,
        factoryId,
        role,
        assignedAt: new Date(),
        assignedBy: 'system', // TODO: Get from current user context
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return await this.db.create('userFactories', newRelation);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to assign user to factory',
      };
    }
  }

  /**
   * Remove user from factory
   */
  async removeUser(factoryId: string, userId: string): Promise<DbResponse<void>> {
    try {
      const relationsResult = await this.db.getAll('userFactories');
      if (!relationsResult.success || !relationsResult.data) {
        return {
          success: false,
          error: relationsResult.error || 'Failed to fetch relations',
        };
      }

      const relation = relationsResult.data.find(
        (uf: UserFactory) => uf.factoryId === factoryId && uf.userId === userId
      );

      if (!relation) {
        return {
          success: false,
          error: 'User factory relation not found',
        };
      }

      return await this.db.delete('userFactories', relation.id);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove user from factory',
      };
    }
  }
}