import { useState, useCallback } from 'react';
import type { Project } from '../types/project';
import { ProjectType } from '../types/project';
import { MockDatabaseImpl } from '../mocks/database/MockDatabase';

export const useProjectHierarchy = () => {
  // Update project's parentId in mock database
  const updateProjectParent = useCallback(async (projectId: string, newParentId: string | null) => {
    try {
      const db = MockDatabaseImpl.getInstance();
      
      // Use the update method which handles saving automatically
      const result = await db.update('projects', projectId, {
        parentId: newParentId || undefined
      });
      
      if (!result.success) {
        console.error('[ProjectHierarchy] Failed to update project parent:', result.error);
        return;
      }
      
      // Force refresh by dispatching a custom event
      window.dispatchEvent(new Event('projectHierarchyChanged'));
      
    } catch (error) {
      console.error('[ProjectHierarchy] Error updating project parent:', error);
    }
  }, []);

  // Move SUB project to a MASTER project
  const moveToMaster = useCallback(async (subProjectId: string, masterProjectId: string) => {
    await updateProjectParent(subProjectId, masterProjectId);
  }, [updateProjectParent]);

  // Make SUB project independent (remove from MASTER)
  const makeIndependent = useCallback(async (subProjectId: string) => {
    await updateProjectParent(subProjectId, null);
  }, [updateProjectParent]);

  // Check if a project can be moved (only SUB projects can be moved)
  const canBeMoved = useCallback((project: Project) => {
    return project.type === ProjectType.SUB;
  }, []);

  // Check if a project can accept children (only MASTER projects)
  const canAcceptChildren = useCallback((project: Project) => {
    return project.type === ProjectType.MASTER;
  }, []);

  return {
    moveToMaster,
    makeIndependent,
    canBeMoved,
    canAcceptChildren,
  };
};