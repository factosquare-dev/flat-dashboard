/**
 * Cleanup duplicate factory IDs in projects
 * This utility removes duplicate factory IDs from all projects in the database
 */

import { MockDatabaseImpl } from '../mocks/database/MockDatabase';
import { DB_COLLECTIONS } from '../mocks/database/types';
import { ProjectFactoryIdField, FactoryTypeLabel, FactoryType, ProjectType } from '../types/enums';

export const cleanupDuplicateFactories = async () => {
  try {
    const db = MockDatabaseImpl.getInstance();
    const database = db.getDatabase();
    
    // Check if projects exist
    if (!database.projects || database.projects.size === 0) {
      console.log('[Cleanup] No projects found in database');
      return 0;
    }
    
    let cleanedCount = 0;
    
    // Iterate through all projects
    for (const [projectId, project] of database.projects.entries()) {
      // Skip if project is null or undefined
      if (!project) {
        // More detailed logging to debug the issue
        console.warn(`[Cleanup] Skipping null/undefined project with key:`, projectId, 'type:', typeof projectId);
        continue;
      }
      
      const updates: any = {};
      let hasChanges = false;
      
      // Master projects should not store factory IDs
      if (project.type === ProjectType.MASTER) {
        if (project.manufacturerId !== undefined || project.containerId !== undefined || project.packagingId !== undefined) {
          updates.manufacturerId = undefined;
          updates.containerId = undefined;
          updates.packagingId = undefined;
          hasChanges = true;
          console.log(`[Cleanup] Project ${projectId}: Removed factory IDs from Master project`);
        }
      } else {
        // For non-Master projects, clean factory IDs
        const cleanFactoryIds = (fieldName: ProjectFactoryIdField, factoryType: FactoryType) => {
          const fieldValue = project[fieldName];
          if (!fieldValue) return;
          
          let ids = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
          let localChanges = false;
          
          // Fix nested array issue (e.g., [['mfg-1', 'mfg-2']] -> ['mfg-1', 'mfg-2'])
          if (ids.length === 1 && Array.isArray(ids[0])) {
            ids = ids[0];
            localChanges = true;
            console.log(`[Cleanup] Project ${projectId}: Fixed nested ${FactoryTypeLabel[factoryType]} array`);
          }
          
          const uniqueIds = [...new Set(ids)];
          if (ids.length !== uniqueIds.length || localChanges) {
            updates[fieldName] = uniqueIds;
            hasChanges = true;
            console.log(`[Cleanup] Project ${projectId}: Cleaned ${FactoryTypeLabel[factoryType]} IDs from ${JSON.stringify(fieldValue)} to ${JSON.stringify(uniqueIds)}`);
          }
        };
        
        // Clean all factory ID fields using enums
        cleanFactoryIds(ProjectFactoryIdField.MANUFACTURER_ID, FactoryType.MANUFACTURING);
        cleanFactoryIds(ProjectFactoryIdField.CONTAINER_ID, FactoryType.CONTAINER);
        cleanFactoryIds(ProjectFactoryIdField.PACKAGING_ID, FactoryType.PACKAGING);
      }
      
      // Update project if there were changes
      if (hasChanges) {
        db.update(DB_COLLECTIONS.PROJECTS, projectId, updates);
        cleanedCount++;
      }
    }
    
    console.log(`[Cleanup] Cleaned ${cleanedCount} projects`);
    return cleanedCount;
  } catch (error) {
    console.error('[Cleanup] Error cleaning duplicate factories:', error);
    return 0;
  }
};

// Export for console usage
(window as any).cleanupDuplicateFactories = cleanupDuplicateFactories;