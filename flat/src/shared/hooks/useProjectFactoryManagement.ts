import { useCallback } from 'react';
import { MockDatabaseImpl } from '@/core/database/MockDatabase';
import { DB_COLLECTIONS } from '@/core/database/types';
import { FactoryType } from '@/shared/types/enums';

/**
 * Custom hook for managing project factory relationships
 * Abstracts MockDatabase operations for factory management
 */
export const useProjectFactoryManagement = () => {
  /**
   * Remove a factory from a project
   */
  const removeFactoryFromProject = useCallback(async (
    projectId: string, 
    factoryId: string, 
    factoryType: FactoryType
  ) => {
    try {
      const db = MockDatabaseImpl.getInstance();
      const database = db.getDatabase();
      const project = database.projects.get(projectId);
      
      if (!project) {
        return { success: false, error: 'Project not found' };
      }
      
      const updates: any = {};
      
      // Remove factory ID based on type
      if (factoryType === FactoryType.MANUFACTURING && project.manufacturerId) {
        const ids = Array.isArray(project.manufacturerId) ? project.manufacturerId : [project.manufacturerId];
        const uniqueIds = [...new Set(ids)];
        const filtered = uniqueIds.filter(id => id !== factoryId);
        updates.manufacturerId = filtered.length > 0 ? filtered : undefined;
      } else if (factoryType === FactoryType.CONTAINER && project.containerId) {
        const ids = Array.isArray(project.containerId) ? project.containerId : [project.containerId];
        const uniqueIds = [...new Set(ids)];
        const filtered = uniqueIds.filter(id => id !== factoryId);
        updates.containerId = filtered.length > 0 ? filtered : undefined;
      } else if (factoryType === FactoryType.PACKAGING && project.packagingId) {
        const ids = Array.isArray(project.packagingId) ? project.packagingId : [project.packagingId];
        const uniqueIds = [...new Set(ids)];
        const filtered = uniqueIds.filter(id => id !== factoryId);
        updates.packagingId = filtered.length > 0 ? filtered : undefined;
      }
      
      // Update project
      const result = await db.update(DB_COLLECTIONS.PROJECTS, projectId, updates);
      
      if (result.success) {
        console.log('[useProjectFactoryManagement] Factory removed from project:', {
          projectId,
          deletedFactoryId: factoryId,
          factoryType,
          updates
        });
      }
      
      return result;
    } catch (error) {
      console.error('[useProjectFactoryManagement] Error removing factory:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to remove factory' 
      };
    }
  }, []);

  /**
   * Add a factory to a project
   */
  const addFactoryToProject = useCallback(async (
    projectId: string,
    factoryId: string,
    factoryType: FactoryType
  ) => {
    try {
      const db = MockDatabaseImpl.getInstance();
      const database = db.getDatabase();
      const project = database.projects.get(projectId);
      
      if (!project) {
        return { success: false, error: 'Project not found' };
      }
      
      const updates: any = {};
      
      // Add factory ID based on type
      if (factoryType === FactoryType.MANUFACTURING) {
        const currentIds = project.manufacturerId 
          ? (Array.isArray(project.manufacturerId) ? project.manufacturerId : [project.manufacturerId])
          : [];
        updates.manufacturerId = [...new Set([...currentIds, factoryId])];
      } else if (factoryType === FactoryType.CONTAINER) {
        const currentIds = project.containerId 
          ? (Array.isArray(project.containerId) ? project.containerId : [project.containerId])
          : [];
        updates.containerId = [...new Set([...currentIds, factoryId])];
      } else if (factoryType === FactoryType.PACKAGING) {
        const currentIds = project.packagingId 
          ? (Array.isArray(project.packagingId) ? project.packagingId : [project.packagingId])
          : [];
        updates.packagingId = [...new Set([...currentIds, factoryId])];
      }
      
      // Update project
      const result = await db.update(DB_COLLECTIONS.PROJECTS, projectId, updates);
      
      if (result.success) {
        console.log('[useProjectFactoryManagement] Factory added to project:', {
          projectId,
          addedFactoryId: factoryId,
          factoryType,
          updates
        });
      }
      
      return result;
    } catch (error) {
      console.error('[useProjectFactoryManagement] Error adding factory:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add factory' 
      };
    }
  }, []);

  return {
    removeFactoryFromProject,
    addFactoryToProject
  };
};