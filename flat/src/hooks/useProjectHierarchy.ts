import { useState, useCallback } from 'react';
import type { Project } from '../types/project';
import { ProjectType } from '../types/project';
import { MockDatabaseImpl } from '../mocks/database/MockDatabase';

export const useProjectHierarchy = () => {
  // Update project's parentId in mock database
  const updateProjectParent = useCallback(async (projectId: string, newParentId: string | null) => {
    try {
      const db = MockDatabaseImpl.getInstance();
      const database = db.getDatabase();
      const project = database.projects.get(projectId);
      
      if (!project) {
        return;
      }
      
      
      // Update the project's parentId
      project.parentId = newParentId || undefined;
      database.projects.set(projectId, project);
      
      // Save to localStorage to persist changes
      (db as any).saveToStorage(database);
      
      
      // Force refresh by dispatching a custom event
      window.dispatchEvent(new Event('projectHierarchyChanged'));
      
    } catch (error) {
      alert('프로젝트 이동 중 오류가 발생했습니다.');
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