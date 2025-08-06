/**
 * Factory Service
 * Handles factory-related operations with user and project relationships
 */

import { BaseService } from './BaseService';
import { Factory } from '@/types/factory';
import { DbResponse } from '../database/types';
import { User } from '@/types/user';
import { Project } from '@/types/project';
import { FactoryRelationsService } from './factory/FactoryRelationsService';
import { FactoryStatisticsService, FactoryStatistics } from './factory/FactoryStatisticsService';
import { CertificateType, FactoryType } from '@/types/enums';

export interface FactoryWithRelations extends Factory {
  users?: Array<User & { role: string }>;
  projects?: Array<Project & { factoryType: string }>;
  statistics?: FactoryStatistics;
}

export class FactoryService extends BaseService<Factory> {
  private relationsService: FactoryRelationsService;
  private statisticsService: FactoryStatisticsService;

  constructor() {
    super('factories');
    this.relationsService = new FactoryRelationsService();
    this.statisticsService = new FactoryStatisticsService();
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
    const users = await this.relationsService.getFactoryUsers(factoryId);
    
    // Get projects
    const projects = await this.relationsService.getFactoryProjects(factoryId);
    
    // Calculate statistics
    const statistics = await this.statisticsService.calculateFactoryStatistics(factoryId);

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
   * Get factories by type
   */
  async getByType(type: FactoryType): Promise<DbResponse<Factory[]>> {
    const result = await this.getAll();
    if (!result.success || !result.data) {
      return result;
    }

    const filtered = result.data.filter(factory => factory.type === type);
    return {
      success: true,
      data: filtered,
    };
  }

  /**
   * Get factories by certificate
   */
  async getByCertificate(certificateType: CertificateType): Promise<DbResponse<Factory[]>> {
    const result = await this.getAll();
    if (!result.success || !result.data) {
      return result;
    }

    const filtered = result.data.filter(factory => 
      factory.certificates && factory.certificates.includes(certificateType)
    );

    return {
      success: true,
      data: filtered,
    };
  }

  /**
   * Search factories
   */
  async search(query: string): Promise<DbResponse<Factory[]>> {
    const result = await this.getAll();
    if (!result.success || !result.data) {
      return result;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = result.data.filter(factory =>
      factory.name.toLowerCase().includes(lowercaseQuery) ||
      factory.address.toLowerCase().includes(lowercaseQuery) ||
      factory.contactPerson?.toLowerCase().includes(lowercaseQuery) ||
      factory.description?.toLowerCase().includes(lowercaseQuery)
    );

    return {
      success: true,
      data: filtered,
    };
  }

  /**
   * Get available factories (not at full capacity)
   */
  async getAvailableFactories(): Promise<DbResponse<Array<Factory & { availableCapacity: number }>>> {
    const factoriesResult = await this.getAll();
    if (!factoriesResult.success || !factoriesResult.data) {
      return factoriesResult;
    }

    const availableFactories: Array<Factory & { availableCapacity: number }> = [];

    for (const factory of factoriesResult.data) {
      const capacityResult = await this.statisticsService.getCapacityAnalysis(factory.id);
      if (capacityResult.success && capacityResult.data && capacityResult.data.availableCapacity > 0) {
        availableFactories.push({
          ...factory,
          availableCapacity: capacityResult.data.availableCapacity,
        });
      }
    }

    return {
      success: true,
      data: availableFactories,
    };
  }

  /**
   * Validate factory before create/update
   */
  protected async validateBeforeCreate(data: Partial<Factory>): Promise<string | null> {
    if (!data.name || data.name.trim() === '') {
      return 'Factory name is required';
    }

    if (!data.type) {
      return 'Factory type is required';
    }

    if (!data.address || data.address.trim() === '') {
      return 'Factory address is required';
    }

    // Check for duplicate name
    const existingResult = await this.getAll();
    if (existingResult.success && existingResult.data) {
      const duplicate = existingResult.data.find(
        f => f.name.toLowerCase() === data.name!.toLowerCase()
      );
      if (duplicate) {
        return 'Factory with this name already exists';
      }
    }

    return null;
  }

  protected async validateBeforeUpdate(id: string, data: Partial<Factory>): Promise<string | null> {
    if (data.name !== undefined && data.name.trim() === '') {
      return 'Factory name cannot be empty';
    }

    // Check for duplicate name if name is being changed
    if (data.name) {
      const existingResult = await this.getAll();
      if (existingResult.success && existingResult.data) {
        const duplicate = existingResult.data.find(
          f => f.id !== id && f.name.toLowerCase() === data.name!.toLowerCase()
        );
        if (duplicate) {
          return 'Factory with this name already exists';
        }
      }
    }

    return null;
  }

  /**
   * Check if factory can be deleted (no active projects)
   */
  protected async validateBeforeDelete(id: string): Promise<string | null> {
    const projectsResult = await this.relationsService.getFactoryProjects(id);
    if (projectsResult.success && projectsResult.data && projectsResult.data.length > 0) {
      const activeProjects = projectsResult.data.filter(
        p => p.status === 'IN_PROGRESS' || p.status === 'PLANNING'
      );
      if (activeProjects.length > 0) {
        return `Cannot delete factory with ${activeProjects.length} active projects`;
      }
    }

    return null;
  }

  // Delegate relation management methods to RelationsService
  async assignUser(factoryId: string, userId: string, role: string = 'operator') {
    return this.relationsService.assignUser(factoryId, userId, role);
  }

  async removeUser(factoryId: string, userId: string) {
    return this.relationsService.removeUser(factoryId, userId);
  }

  async getFactoryUsers(factoryId: string) {
    return this.relationsService.getFactoryUsers(factoryId);
  }

  async getFactoryProjects(factoryId: string) {
    return this.relationsService.getFactoryProjects(factoryId);
  }

  // Delegate statistics methods to StatisticsService
  async calculateFactoryStatistics(factoryId: string) {
    return this.statisticsService.calculateFactoryStatistics(factoryId);
  }

  async getCapacityAnalysis(factoryId: string) {
    return this.statisticsService.getCapacityAnalysis(factoryId);
  }

  async getPerformanceTrends(factoryId: string, months?: number) {
    return this.statisticsService.getPerformanceTrends(factoryId, months);
  }
}