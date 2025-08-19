/**
 * Project Query Service
 * Handles project queries and filtering
 */

import { BaseService } from '@/mocks/services/BaseService';
import { Project, ProjectStatus, ProjectType } from '@/types/project';
import { DbResponse } from '@/mocks/database/types';

export class ProjectQueryService extends BaseService<Project> {
  constructor() {
    super('projects');
  }

  /**
   * Get projects by status
   */
  async getByStatus(status: ProjectStatus): Promise<DbResponse<Project[]>> {
    const result = await this.getAll();
    if (!result.success || !result.data) {
      return result;
    }
    
    const filtered = result.data.filter(project => project.status === status);
    return {
      success: true,
      data: filtered,
    };
  }

  /**
   * Get projects by customer
   */
  async getByCustomer(customerId: string): Promise<DbResponse<Project[]>> {
    const result = await this.getAll();
    if (!result.success || !result.data) {
      return result;
    }
    
    const filtered = result.data.filter(project => project.customerId === customerId);
    return {
      success: true,
      data: filtered,
    };
  }

  /**
   * Get projects by type
   */
  async getByType(type: ProjectType): Promise<DbResponse<Project[]>> {
    const result = await this.getAll();
    if (!result.success || !result.data) {
      return result;
    }
    
    const filtered = result.data.filter(project => project.type === type);
    return {
      success: true,
      data: filtered,
    };
  }

  /**
   * Get projects by factory
   */
  async getByFactory(factoryId: string, factoryType?: 'manufacturer' | 'container' | 'packaging'): Promise<DbResponse<Project[]>> {
    const result = await this.getAll();
    if (!result.success || !result.data) {
      return result;
    }
    
    const filtered = result.data.filter(project => {
      if (factoryType === 'manufacturer') {
        return project.manufacturerId === factoryId;
      } else if (factoryType === 'container') {
        return project.containerId === factoryId;
      } else if (factoryType === 'packaging') {
        return project.packagingId === factoryId;
      } else {
        // Check all factory types
        return project.manufacturerId === factoryId || 
               project.containerId === factoryId || 
               project.packagingId === factoryId;
      }
    });
    
    return {
      success: true,
      data: filtered,
    };
  }

  /**
   * Get projects within date range
   */
  async getByDateRange(startDate: Date, endDate: Date): Promise<DbResponse<Project[]>> {
    const result = await this.getAll();
    if (!result.success || !result.data) {
      return result;
    }
    
    const filtered = result.data.filter(project => {
      const projectStart = new Date(project.startDate);
      const projectEnd = new Date(project.endDate);
      
      // Check if project overlaps with the date range
      return projectStart <= endDate && projectEnd >= startDate;
    });
    
    return {
      success: true,
      data: filtered,
    };
  }

  /**
   * Get overdue projects
   */
  async getOverdueProjects(): Promise<DbResponse<Project[]>> {
    const result = await this.getAll();
    if (!result.success || !result.data) {
      return result;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const filtered = result.data.filter(project => {
      const projectEnd = new Date(project.endDate);
      projectEnd.setHours(0, 0, 0, 0);
      
      return projectEnd < today && 
             project.status !== ProjectStatus.COMPLETED && 
             project.status !== ProjectStatus.CANCELLED;
    });
    
    return {
      success: true,
      data: filtered,
    };
  }

  /**
   * Search projects by name or description
   */
  async searchProjects(query: string): Promise<DbResponse<Project[]>> {
    const result = await this.getAll();
    if (!result.success || !result.data) {
      return result;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = result.data.filter(project => {
      return project.name.toLowerCase().includes(lowerQuery) ||
             (project.client && project.client.toLowerCase().includes(lowerQuery)) ||
             (project.product?.name && project.product.name.toLowerCase().includes(lowerQuery));
    });
    
    return {
      success: true,
      data: filtered,
    };
  }

  /**
   * Get project statistics
   */
  async getProjectStats(): Promise<DbResponse<{
    total: number;
    byStatus: Record<ProjectStatus, number>;
    byType: Record<ProjectType, number>;
    overdue: number;
    completionRate: number;
  }>> {
    const result = await this.getAll();
    if (!result.success || !result.data) {
      return {
        success: false,
        error: 'Failed to get projects',
      };
    }
    
    const projects = result.data;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats = {
      total: projects.length,
      byStatus: {} as Record<ProjectStatus, number>,
      byType: {} as Record<ProjectType, number>,
      overdue: 0,
      completionRate: 0,
    };
    
    // Initialize counters
    Object.values(ProjectStatus).forEach(status => {
      stats.byStatus[status] = 0;
    });
    Object.values(ProjectType).forEach(type => {
      stats.byType[type] = 0;
    });
    
    // Count projects
    projects.forEach(project => {
      stats.byStatus[project.status]++;
      stats.byType[project.type]++;
      
      // Check if overdue
      const projectEnd = new Date(project.endDate);
      projectEnd.setHours(0, 0, 0, 0);
      
      if (projectEnd < today && 
          project.status !== ProjectStatus.COMPLETED && 
          project.status !== ProjectStatus.CANCELLED) {
        stats.overdue++;
      }
    });
    
    // Calculate completion rate
    if (stats.total > 0) {
      stats.completionRate = Math.round((stats.byStatus[ProjectStatus.COMPLETED] / stats.total) * 100);
    }
    
    return {
      success: true,
      data: stats,
    };
  }
}