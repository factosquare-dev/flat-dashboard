import { useState, useCallback } from 'react';
import type { Project } from '../types/project';
import { ProjectType } from '../types/project';

export const useProjectHierarchy = () => {
  // Mock function to update project's parentId
  // In real implementation, this would call the backend API
  const updateProjectParent = useCallback(async (projectId: string, newParentId: string | null) => {
    // TODO: Call backend API to update project.parentId
    // For now, just show alert
    if (newParentId) {
      alert(`프로젝트 이동 기능은 백엔드 API 연동이 필요합니다.`);
    } else {
      alert(`프로젝트를 독립 프로젝트로 만들려면 백엔드 API 연동이 필요합니다.`);
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