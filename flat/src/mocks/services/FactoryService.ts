/**
 * Factory Service
 * Handles factory-related operations with user and project relationships
 */

import { BaseService } from './BaseService';
import { Factory } from '@/types/factory';
import { DbResponse, UserFactory, FactoryProject } from '../database/types';
import { User } from '@/types/user';
import { Project } from '@/types/project';

export interface FactoryWithRelations extends Factory {
  users?: Array<User & { role: string }>;
  projects?: Array<Project & { factoryType: string }>;
  statistics?: {
    totalProjects: number;
    activeProjects: number;
    totalUsers: number;
    capacityUtilization: number;
  };
}

export class FactoryService extends BaseService<Factory> {
  constructor() {
    super('factories');
  }

  /**
   * Get factory with all relations
   */
  async getByIdWithRelations(factoryId: string): Promise<DbResponse<FactoryWithRelations>> {
    const factoryResult = await this.getById(factoryId);
    if (!factoryResult.success || !factoryResult.data) {
      return factoryResult;
    }

    const factory = factoryResult.data;
    
    // Get users
    const users = await this.getFactoryUsers(factoryId);
    
    // Get projects
    const projects = await this.getFactoryProjects(factoryId);
    
    // Calculate statistics
    const statistics = await this.calculateFactoryStatistics(factoryId);

    return {
      success: true,
      data: {
        ...factory,
        users: users.data || [],
        projects: projects.data || [],
        statistics: statistics.data,
      },
    };
  }

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
   * Get factory projects with types
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
   * Calculate factory statistics
   */
  async calculateFactoryStatistics(factoryId: string): Promise<DbResponse<FactoryWithRelations['statistics']>> {
    try {
      const projectsResult = await this.getFactoryProjects(factoryId);
      const usersResult = await this.getFactoryUsers(factoryId);
      const factoryResult = await this.getById(factoryId);

      if (!projectsResult.success || !usersResult.success || !factoryResult.success) {
        return {
          success: false,
          error: 'Failed to calculate statistics',
        };
      }

      const projects = projectsResult.data || [];
      const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS');
      const factory = factoryResult.data!;

      // Calculate capacity utilization (mock calculation)
      const totalQuantity = activeProjects.reduce((sum, p) => sum + (p.quantity || 0), 0);
      const capacityUtilization = factory.capacity ? (totalQuantity / factory.capacity) * 100 : 0;

      return {
        success: true,
        data: {
          totalProjects: projects.length,
          activeProjects: activeProjects.length,
          totalUsers: usersResult.data?.length || 0,
          capacityUtilization: Math.min(capacityUtilization, 100),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate statistics',
      };
    }
  }

  /**
   * Get factories by type
   */
  async getByType(type: '제조' | '용기' | '포장'): Promise<DbResponse<Factory[]>> {
    return this.find({ type });
  }

  /**
   * Get available factories for a project
   */
  async getAvailableFactories(projectStartDate: Date, projectEndDate: Date): Promise<DbResponse<Factory[]>> {
    try {
      const allFactoriesResult = await this.getAll();
      if (!allFactoriesResult.success || !allFactoriesResult.data) {
        return allFactoriesResult;
      }

      const availableFactories: Factory[] = [];

      for (const factory of allFactoriesResult.data) {
        const isAvailable = await this.checkFactoryAvailability(
          factory.id,
          projectStartDate,
          projectEndDate
        );
        
        if (isAvailable.data) {
          availableFactories.push(factory);
        }
      }

      return {
        success: true,
        data: availableFactories,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get available factories',
      };
    }
  }

  /**
   * Check if factory is available for date range
   */
  async checkFactoryAvailability(
    factoryId: string,
    startDate: Date,
    endDate: Date
  ): Promise<DbResponse<boolean>> {
    try {
      const projectsResult = await this.getFactoryProjects(factoryId);
      if (!projectsResult.success || !projectsResult.data) {
        return {
          success: false,
          error: projectsResult.error || 'Failed to check availability',
        };
      }

      // Check for overlapping projects
      const hasConflict = projectsResult.data.some(project => {
        if (project.status === 'COMPLETED' || project.status === 'CANCELLED') {
          return false;
        }

        const projectStart = new Date(project.startDate);
        const projectEnd = new Date(project.endDate);

        return (
          (startDate >= projectStart && startDate <= projectEnd) ||
          (endDate >= projectStart && endDate <= projectEnd) ||
          (startDate <= projectStart && endDate >= projectEnd)
        );
      });

      return {
        success: true,
        data: !hasConflict,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check availability',
      };
    }
  }

  /**
   * Assign factory to project
   */
  async assignToProject(
    factoryId: string,
    projectId: string,
    factoryType: 'manufacturer' | 'container' | 'packaging',
    isPrimary: boolean = false
  ): Promise<DbResponse<FactoryProject>> {
    // Check if assignment already exists
    const existingResult = await this.db.getAll('factoryProjects');
    if (existingResult.success && existingResult.data) {
      const existing = existingResult.data.find(
        (fp: FactoryProject) => 
          fp.factoryId === factoryId && 
          fp.projectId === projectId &&
          fp.factoryType === factoryType
      );
      
      if (existing) {
        return {
          success: false,
          error: 'Factory already assigned to this project for this type',
        };
      }
    }

    const relationId = `fp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const factoryProject: FactoryProject = {
      id: relationId,
      projectId,
      factoryId,
      factoryType,
      isPrimary,
      assignedAt: new Date(),
    };

    return this.db.create('factoryProjects', relationId, factoryProject);
  }

  /**
   * Remove factory from project
   */
  async removeFromProject(factoryId: string, projectId: string): Promise<DbResponse<void>> {
    const relationsResult = await this.db.getAll('factoryProjects');
    if (!relationsResult.success || !relationsResult.data) {
      return {
        success: false,
        error: relationsResult.error || 'Failed to fetch relations',
      };
    }

    const relations = relationsResult.data.filter(
      (fp: FactoryProject) => fp.factoryId === factoryId && fp.projectId === projectId
    );

    if (relations.length === 0) {
      return {
        success: false,
        error: 'Factory not assigned to this project',
      };
    }

    // Remove all relations for this factory-project pair
    for (const relation of relations) {
      await this.db.delete('factoryProjects', relation.id);
    }

    return {
      success: true,
      message: 'Factory removed from project',
    };
  }

  /**
   * Update factory capacity
   */
  async updateCapacity(factoryId: string, newCapacity: number): Promise<DbResponse<Factory>> {
    if (newCapacity < 0) {
      return {
        success: false,
        error: 'Capacity cannot be negative',
      };
    }

    return this.update(factoryId, { capacity: newCapacity });
  }

  /**
   * Add certification to factory
   */
  async addCertification(factoryId: string, certification: string): Promise<DbResponse<Factory>> {
    const factoryResult = await this.getById(factoryId);
    if (!factoryResult.success || !factoryResult.data) {
      return factoryResult;
    }

    const factory = factoryResult.data;
    const certifications = [...(factory.certifications || [])];
    
    if (!certifications.includes(certification)) {
      certifications.push(certification);
      return this.update(factoryId, { certifications });
    }

    return {
      success: false,
      error: 'Certification already exists',
    };
  }

  /**
   * Remove certification from factory
   */
  async removeCertification(factoryId: string, certification: string): Promise<DbResponse<Factory>> {
    const factoryResult = await this.getById(factoryId);
    if (!factoryResult.success || !factoryResult.data) {
      return factoryResult;
    }

    const factory = factoryResult.data;
    const certifications = factory.certifications?.filter(c => c !== certification) || [];
    
    return this.update(factoryId, { certifications });
  }

  /**
   * Get factories with low utilization
   */
  async getLowUtilizationFactories(threshold: number = 50): Promise<DbResponse<FactoryWithRelations[]>> {
    try {
      const allFactoriesResult = await this.getAll();
      if (!allFactoriesResult.success || !allFactoriesResult.data) {
        return {
          success: false,
          error: allFactoriesResult.error || 'Failed to fetch factories',
        };
      }

      const lowUtilizationFactories: FactoryWithRelations[] = [];

      for (const factory of allFactoriesResult.data) {
        const withRelationsResult = await this.getByIdWithRelations(factory.id);
        if (withRelationsResult.success && withRelationsResult.data) {
          const utilization = withRelationsResult.data.statistics?.capacityUtilization || 0;
          if (utilization < threshold) {
            lowUtilizationFactories.push(withRelationsResult.data);
          }
        }
      }

      return {
        success: true,
        data: lowUtilizationFactories,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get low utilization factories',
      };
    }
  }

  /**
   * Delete factory (with checks)
   */
  async delete(factoryId: string): Promise<DbResponse<void>> {
    // Check if factory has active projects
    const projectsResult = await this.getFactoryProjects(factoryId);
    if (projectsResult.success && projectsResult.data && projectsResult.data.length > 0) {
      const activeProjects = projectsResult.data.filter(
        p => p.status === 'IN_PROGRESS' || p.status === 'PLANNING'
      );
      
      if (activeProjects.length > 0) {
        return {
          success: false,
          error: 'Cannot delete factory with active projects',
        };
      }
    }

    // Remove all user relations
    const userRelations = await this.db.getAll('userFactories');
    if (userRelations.success && userRelations.data) {
      const factoryRelations = userRelations.data.filter(
        (uf: UserFactory) => uf.factoryId === factoryId
      );
      
      for (const relation of factoryRelations) {
        await this.db.delete('userFactories', relation.id);
      }
    }

    // Remove all project relations
    const projectRelations = await this.db.getAll('factoryProjects');
    if (projectRelations.success && projectRelations.data) {
      const factoryProjectRelations = projectRelations.data.filter(
        (fp: FactoryProject) => fp.factoryId === factoryId
      );
      
      for (const relation of factoryProjectRelations) {
        await this.db.delete('factoryProjects', relation.id);
      }
    }

    // Delete the factory
    return super.delete(factoryId);
  }
}