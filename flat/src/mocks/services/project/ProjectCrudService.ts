/**
 * Project CRUD Service
 * Handles basic Create, Read, Update, Delete operations for projects
 */

import { BaseService } from '../BaseService';
import { Project, ProjectType, ProjectStatus } from '@/types/project';
import { DbResponse } from '../../database/types';
import { 
  validateSubProjectSync, 
  syncSubWithMaster, 
  updateSubProjectsFromMaster,
  MASTER_SUB_SYNC_FIELDS
} from '@/utils/projectValidation';

export class ProjectCrudService extends BaseService<Project> {
  constructor() {
    super('projects');
  }

  /**
   * Override create to add validation for project type and parentId
   */
  async create(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<DbResponse<Project>> {
    // Validate project type and parentId relationship
    const validatedData = { ...data };
    
    // If creating MASTER type, ensure parentId is removed
    if (validatedData.type === ProjectType.MASTER && validatedData.parentId) {
      delete validatedData.parentId;
    }
    
    // If project has parentId but type is MASTER, throw error
    if (validatedData.type === ProjectType.MASTER && validatedData.parentId !== undefined && validatedData.parentId !== null) {
      return {
        success: false,
        error: 'MASTER projects cannot have a parent project',
      };
    }
    
    // Only SUB projects can have parentId
    if (validatedData.parentId && validatedData.type && validatedData.type !== ProjectType.SUB) {
      return {
        success: false,
        error: 'Only SUB projects can have a parent project',
      };
    }
    
    // If creating SUB project with parentId, validate and sync fields from MASTER
    if (validatedData.type === ProjectType.SUB && validatedData.parentId) {
      const masterResult = await this.getById(validatedData.parentId);
      if (!masterResult.success || !masterResult.data) {
        return {
          success: false,
          error: 'Parent MASTER project not found',
        };
      }
      
      const masterProject = masterResult.data;
      if (masterProject.type !== ProjectType.MASTER) {
        return {
          success: false,
          error: 'Parent project must be a MASTER project',
        };
      }
      
      // Validate SUB project fields against MASTER
      const validation = validateSubProjectSync(validatedData, masterProject);
      if (!validation.isValid) {
        return {
          success: false,
          error: `SUB project validation failed: ${validation.errors.join(', ')}`,
        };
      }
      
      // Sync required fields from MASTER
      const syncedData = syncSubWithMaster(validatedData, masterProject);
      return super.create(syncedData as Omit<Project, 'id' | 'createdAt' | 'updatedAt'>);
    }
    
    return super.create(validatedData);
  }

  /**
   * Override update to add validation and sync logic
   */
  async update(id: string, data: Partial<Project>): Promise<DbResponse<Project>> {
    // Get current project
    const currentResult = await this.getById(id);
    if (!currentResult.success || !currentResult.data) {
      return currentResult as DbResponse<Project>;
    }
    
    const currentProject = currentResult.data;
    
    // Validate type and parentId updates
    const updatedData = { ...data };
    
    // Cannot change MASTER project to have parentId
    if (currentProject.type === ProjectType.MASTER && updatedData.parentId !== undefined) {
      delete updatedData.parentId;
    }
    
    // Cannot change type of project that has parentId to MASTER
    if (updatedData.type === ProjectType.MASTER && (currentProject.parentId || updatedData.parentId)) {
      return {
        success: false,
        error: 'Cannot change project with parent to MASTER type',
      };
    }
    
    // If changing parentId or updating a SUB project with parentId
    if (currentProject.type === ProjectType.SUB && currentProject.parentId) {
      const masterResult = await this.getById(currentProject.parentId);
      if (masterResult.success && masterResult.data) {
        const masterProject = masterResult.data;
        
        // Check if any sync fields are being updated
        const syncFields = Object.keys(updatedData).filter(field => 
          MASTER_SUB_SYNC_FIELDS.includes(field as keyof Project)
        );
        
        if (syncFields.length > 0) {
          return {
            success: false,
            error: `Cannot update sync fields on SUB project: ${syncFields.join(', ')}. These fields are controlled by the MASTER project.`,
          };
        }
      }
    }
    
    // Update the project
    const updateResult = await super.update(id, updatedData);
    if (!updateResult.success || !updateResult.data) {
      return updateResult;
    }
    
    // If this is a MASTER project and sync fields were updated, update all SUB projects
    if (currentProject.type === ProjectType.MASTER) {
      const syncFields = Object.keys(updatedData).filter(field => 
        MASTER_SUB_SYNC_FIELDS.includes(field as keyof Project)
      );
      
      if (syncFields.length > 0) {
        // Get all sub projects
        const subProjectsResult = await this.getAll();
        if (subProjectsResult.success && subProjectsResult.data) {
          const subProjects = subProjectsResult.data.filter(p => 
            p.type === ProjectType.SUB && p.parentId === id
          );
          
          // Update each sub project
          for (const subProject of subProjects) {
            const syncData = updateSubProjectsFromMaster(updatedData as Project);
            await super.update(subProject.id, syncData);
          }
        }
      }
    }
    
    return updateResult;
  }

  /**
   * Update project status
   */
  async updateStatus(projectId: string, status: ProjectStatus): Promise<DbResponse<Project>> {
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
    
    const updateResult = await this.update(projectId, { progress });
    
    if (updateResult.success && updateResult.data) {
      // Auto-update status based on progress
      const project = updateResult.data;
      let newStatus: ProjectStatus | undefined;
      
      if (progress === 0 && project.status !== ProjectStatus.NOT_STARTED) {
        newStatus = ProjectStatus.NOT_STARTED;
      } else if (progress > 0 && progress < 100 && project.status !== ProjectStatus.IN_PROGRESS) {
        newStatus = ProjectStatus.IN_PROGRESS;
      } else if (progress === 100 && project.status !== ProjectStatus.COMPLETED) {
        newStatus = ProjectStatus.COMPLETED;
      }
      
      if (newStatus) {
        return this.update(projectId, { status: newStatus });
      }
    }
    
    return updateResult;
  }

  /**
   * Delete project with cascade handling
   */
  async delete(projectId: string): Promise<DbResponse<void>> {
    const db = this.getDatabase();
    
    // Check if project has sub projects
    const project = await this.getById(projectId);
    if (project.success && project.data && project.data.type === ProjectType.MASTER) {
      const subProjects = Array.from(db.projects.values()).filter(p => 
        p.type === ProjectType.SUB && p.parentId === projectId
      );
      
      if (subProjects.length > 0) {
        return {
          success: false,
          error: `Cannot delete MASTER project with ${subProjects.length} sub projects. Delete sub projects first.`,
        };
      }
    }
    
    // Delete related data
    // 1. Delete project assignments
    const assignments = Array.from(db.projectAssignments.values())
      .filter(pa => pa.projectId === projectId);
    assignments.forEach(pa => db.projectAssignments.delete(pa.id));
    
    // 2. Delete factory projects
    const factoryProjects = Array.from(db.factoryProjects.values())
      .filter(fp => fp.projectId === projectId);
    factoryProjects.forEach(fp => db.factoryProjects.delete(fp.id));
    
    // 3. Delete schedules and tasks
    const schedules = Array.from(db.schedules.values())
      .filter(s => s.projectId === projectId);
    schedules.forEach(schedule => {
      // Delete tasks
      const tasks = Array.from(db.tasks.values())
        .filter(t => t.scheduleId === schedule.id);
      tasks.forEach(task => db.tasks.delete(task.id));
      
      // Delete schedule
      db.schedules.delete(schedule.id);
    });
    
    // 4. Delete comments
    const comments = Array.from(db.comments.values())
      .filter(c => c.entityType === 'project' && c.entityId === projectId);
    comments.forEach(comment => db.comments.delete(comment.id));
    
    // 5. Delete the project
    return super.delete(projectId);
  }
}