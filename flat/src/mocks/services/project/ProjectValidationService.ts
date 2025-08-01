/**
 * Project Validation Service
 * Handles project validation and synchronization between MASTER and SUB projects
 */

import { BaseService } from '../BaseService';
import { Project, ProjectType } from '@/types/project';
import { DbResponse } from '@/mocks/database/types';
import { 
  validateSubProjectSync, 
  syncSubWithMaster, 
  updateSubProjectsFromMaster,
  MASTER_SUB_SYNC_FIELDS
} from '@/utils/projectValidation';
import { ProjectCrudService } from './ProjectCrudService';

export class ProjectValidationService extends BaseService<Project> {
  private projectCrud: ProjectCrudService;

  constructor() {
    super('projects');
    this.projectCrud = new ProjectCrudService();
  }

  /**
   * Sync all SUB projects with their MASTER project
   */
  async syncSubProjectsWithMaster(masterId: string): Promise<DbResponse<number>> {
    // Get master project
    const masterResult = await this.projectCrud.getById(masterId);
    if (!masterResult.success || !masterResult.data) {
      return {
        success: false,
        error: 'Master project not found',
      };
    }
    
    const masterProject = masterResult.data;
    if (masterProject.type !== ProjectType.MASTER) {
      return {
        success: false,
        error: 'Project is not a MASTER project',
      };
    }
    
    // Get all sub projects
    const allProjectsResult = await this.getAll();
    if (!allProjectsResult.success || !allProjectsResult.data) {
      return {
        success: false,
        error: 'Failed to get projects',
      };
    }
    
    const subProjects = allProjectsResult.data.filter(p => 
      p.type === ProjectType.SUB && p.parentId === masterId
    );
    
    let syncedCount = 0;
    
    // Sync each sub project
    for (const subProject of subProjects) {
      const syncData = updateSubProjectsFromMaster(masterProject);
      const updateResult = await this.projectCrud.update(subProject.id, syncData);
      
      if (updateResult.success) {
        syncedCount++;
      } else {
        console.error(`Failed to sync sub project ${subProject.id}:`, updateResult.error);
      }
    }
    
    return {
      success: true,
      data: syncedCount,
      message: `Synced ${syncedCount} out of ${subProjects.length} sub projects`,
    };
  }

  /**
   * Validate MASTER-SUB project consistency
   */
  async validateMasterSubConsistency(projectId: string): Promise<DbResponse<{ isValid: boolean; errors: string[] }>> {
    // Get project
    const projectResult = await this.projectCrud.getById(projectId);
    if (!projectResult.success || !projectResult.data) {
      return {
        success: false,
        error: 'Project not found',
      };
    }
    
    const project = projectResult.data;
    const errors: string[] = [];
    
    if (project.type === ProjectType.MASTER) {
      // Validate all sub projects
      const allProjectsResult = await this.getAll();
      if (!allProjectsResult.success || !allProjectsResult.data) {
        return {
          success: false,
          error: 'Failed to get projects',
        };
      }
      
      const subProjects = allProjectsResult.data.filter(p => 
        p.type === ProjectType.SUB && p.parentId === projectId
      );
      
      for (const subProject of subProjects) {
        const validation = validateSubProjectSync(subProject, project);
        if (!validation.isValid) {
          errors.push(`SUB project ${subProject.id} (${subProject.name}): ${validation.errors.join(', ')}`);
        }
      }
    } else if (project.type === ProjectType.SUB && project.parentId) {
      // Validate against master
      const masterResult = await this.projectCrud.getById(project.parentId);
      if (!masterResult.success || !masterResult.data) {
        errors.push('Parent MASTER project not found');
      } else {
        const masterProject = masterResult.data;
        const validation = validateSubProjectSync(project, masterProject);
        if (!validation.isValid) {
          errors.push(...validation.errors);
        }
      }
    }
    
    return {
      success: true,
      data: {
        isValid: errors.length === 0,
        errors,
      },
    };
  }

  /**
   * Validate project dates
   */
  async validateProjectDates(projectId: string): Promise<DbResponse<{ isValid: boolean; errors: string[] }>> {
    const projectResult = await this.projectCrud.getById(projectId);
    if (!projectResult.success || !projectResult.data) {
      return {
        success: false,
        error: 'Project not found',
      };
    }
    
    const project = projectResult.data;
    const errors: string[] = [];
    
    // Validate basic date logic
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    
    if (startDate >= endDate) {
      errors.push('Project end date must be after start date');
    }
    
    // Validate against parent project dates if SUB
    if (project.type === ProjectType.SUB && project.parentId) {
      const masterResult = await this.projectCrud.getById(project.parentId);
      if (masterResult.success && masterResult.data) {
        const masterProject = masterResult.data;
        const masterStart = new Date(masterProject.startDate);
        const masterEnd = new Date(masterProject.endDate);
        
        if (startDate < masterStart) {
          errors.push(`SUB project start date cannot be before MASTER project start date (${masterStart.toLocaleDateString()})`);
        }
        
        if (endDate > masterEnd) {
          errors.push(`SUB project end date cannot be after MASTER project end date (${masterEnd.toLocaleDateString()})`);
        }
      }
    }
    
    // Validate against sub projects if MASTER
    if (project.type === ProjectType.MASTER) {
      const allProjectsResult = await this.getAll();
      if (allProjectsResult.success && allProjectsResult.data) {
        const subProjects = allProjectsResult.data.filter(p => 
          p.type === ProjectType.SUB && p.parentId === projectId
        );
        
        for (const subProject of subProjects) {
          const subStart = new Date(subProject.startDate);
          const subEnd = new Date(subProject.endDate);
          
          if (subStart < startDate || subEnd > endDate) {
            errors.push(`SUB project "${subProject.name}" has dates outside MASTER project range`);
          }
        }
      }
    }
    
    return {
      success: true,
      data: {
        isValid: errors.length === 0,
        errors,
      },
    };
  }

  /**
   * Validate project dependencies
   */
  async validateProjectDependencies(projectId: string): Promise<DbResponse<{ isValid: boolean; errors: string[] }>> {
    const projectResult = await this.projectCrud.getById(projectId);
    if (!projectResult.success || !projectResult.data) {
      return {
        success: false,
        error: 'Project not found',
      };
    }
    
    const project = projectResult.data;
    const errors: string[] = [];
    const db = this.getDatabase();
    
    // Check if factories exist
    if (project.manufacturerId) {
      const factory = db.factories.get(project.manufacturerId);
      if (!factory) {
        errors.push(`Manufacturer factory (${project.manufacturerId}) not found`);
      }
    }
    
    if (project.containerId) {
      const factory = db.factories.get(project.containerId);
      if (!factory) {
        errors.push(`Container factory (${project.containerId}) not found`);
      }
    }
    
    if (project.packagingId) {
      const factory = db.factories.get(project.packagingId);
      if (!factory) {
        errors.push(`Packaging factory (${project.packagingId}) not found`);
      }
    }
    
    // Check if customer exists
    const customer = db.customers.get(project.customerId);
    if (!customer) {
      errors.push(`Customer (${project.customerId}) not found`);
    }
    
    // Check if schedule exists
    if (project.scheduleId) {
      const schedule = db.schedules.get(project.scheduleId);
      if (!schedule) {
        errors.push(`Schedule (${project.scheduleId}) not found`);
      }
    }
    
    return {
      success: true,
      data: {
        isValid: errors.length === 0,
        errors,
      },
    };
  }
}