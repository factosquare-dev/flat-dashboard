/**
 * Project Aggregation Manager
 * Handles Master/Sub project relationship and aggregation logic
 */

import { MockDatabase } from '../types';
import { Project, ProjectType } from '@/types/project';
import { DbResponse } from '../types';
import { StorageManager } from './StorageManager';

export class ProjectAggregationManager {
  constructor(
    private db: MockDatabase,
    private storageManager: StorageManager
  ) {}

  /**
   * Update Master project with aggregated data from SUB projects
   */
  updateMasterProjectAggregates(masterId: string): DbResponse<void> {
    try {
      const masterProject = this.db.projects.get(masterId);
      if (!masterProject || masterProject.type !== ProjectType.MASTER) {
        return { success: false, error: 'Master project not found' };
      }

      // Get all SUB projects for this master
      const subProjects = Array.from(this.db.projects.values())
        .filter(p => p.type === ProjectType.SUB && p.parentId === masterId);

      if (subProjects.length === 0) {
        // No SUB projects, keep master as is
        return { success: true };
      }

      // Calculate aggregated values
      const aggregatedSales = subProjects.reduce((sum, sub) => {
        const sales = typeof sub.sales === 'string' ? parseFloat(sub.sales) || 0 : sub.sales || 0;
        return sum + sales;
      }, 0);

      const aggregatedPurchase = subProjects.reduce((sum, sub) => {
        const purchase = typeof sub.purchase === 'string' ? parseFloat(sub.purchase) || 0 : sub.purchase || 0;
        return sum + purchase;
      }, 0);

      // Calculate date range from SUB projects
      const subStartDates = subProjects
        .map(sub => sub.startDate)
        .filter(date => date)
        .map(date => new Date(date).getTime());
      
      const subEndDates = subProjects
        .map(sub => sub.endDate)
        .filter(date => date)
        .map(date => new Date(date).getTime());

      const earliestStartDate = subStartDates.length > 0 
        ? new Date(Math.min(...subStartDates))
        : masterProject.startDate;
      
      const latestEndDate = subEndDates.length > 0 
        ? new Date(Math.max(...subEndDates))
        : masterProject.endDate;

      // Collect all unique factory IDs from SUB projects
      const allManufacturerIds = new Set<string>();
      const allContainerIds = new Set<string>();
      const allPackagingIds = new Set<string>();

      subProjects.forEach(sub => {
        // Handle manufacturer IDs
        if (sub.manufacturerId) {
          if (Array.isArray(sub.manufacturerId)) {
            sub.manufacturerId.forEach(id => allManufacturerIds.add(id));
          } else {
            allManufacturerIds.add(sub.manufacturerId);
          }
        }
        
        // Handle container IDs
        if (sub.containerId) {
          if (Array.isArray(sub.containerId)) {
            sub.containerId.forEach(id => allContainerIds.add(id));
          } else {
            allContainerIds.add(sub.containerId);
          }
        }
        
        // Handle packaging IDs
        if (sub.packagingId) {
          if (Array.isArray(sub.packagingId)) {
            sub.packagingId.forEach(id => allPackagingIds.add(id));
          } else {
            allPackagingIds.add(sub.packagingId);
          }
        }
      });

      // Update master project with aggregated data
      // Note: Factory IDs are NOT stored in Master - they are fetched from SUBs on demand
      const updatedMaster = {
        ...masterProject,
        sales: aggregatedSales,
        purchase: aggregatedPurchase,
        startDate: earliestStartDate,
        endDate: latestEndDate,
        // Factory IDs are intentionally NOT aggregated here
        // They should be fetched from SUB projects when needed
        updatedAt: new Date()
      };

      // Save updated master project
      this.db.projects.set(masterId, updatedMaster);
      this.storageManager.saveToStorage(this.db);

      // Master project aggregates updated
      return { success: true };
    } catch (error) {
      // Error updating master project aggregates
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get aggregated tasks for a master project
   */
  getAggregatedTasksForMaster(masterId: string) {
    const subProjects = Array.from(this.db.projects.values())
      .filter(p => p.type === ProjectType.SUB && p.parentId === masterId);

    const aggregatedTasks: any[] = [];
    
    subProjects.forEach(subProject => {
      const schedule = Array.from(this.db.schedules.values())
        .find(s => s.projectId === subProject.id);
      
      if (schedule) {
        const tasks = Array.from(this.db.tasks.values())
          .filter(t => t.scheduleId === schedule.id);
        
        tasks.forEach(task => {
          aggregatedTasks.push({
            ...task,
            subProjectId: subProject.id,
            subProjectName: subProject.name
          });
        });
      }
    });

    return aggregatedTasks;
  }

  /**
   * Update all master projects in the database
   */
  updateAllMasterProjects(): void {
    const masterProjects = Array.from(this.db.projects.values())
      .filter(p => p.type === ProjectType.MASTER);
    
    masterProjects.forEach(master => {
      this.updateMasterProjectAggregates(master.id);
    });
  }

  /**
   * Check if a project has sub-projects
   */
  hasSubProjects(projectId: string): boolean {
    return Array.from(this.db.projects.values())
      .some(p => p.parentId === projectId);
  }

  /**
   * Get sub-projects for a master project
   */
  getSubProjects(masterId: string): Project[] {
    return Array.from(this.db.projects.values())
      .filter(p => p.type === ProjectType.SUB && p.parentId === masterId);
  }

  /**
   * Get master project for a sub-project
   */
  getMasterProject(subProjectId: string): Project | null {
    const subProject = this.db.projects.get(subProjectId);
    if (!subProject || !subProject.parentId) {
      return null;
    }
    
    const master = this.db.projects.get(subProject.parentId);
    return master && master.type === ProjectType.MASTER ? master : null;
  }
}