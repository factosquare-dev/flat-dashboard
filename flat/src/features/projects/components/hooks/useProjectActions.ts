/**
 * Project actions hook - handles CRUD operations
 */

import { useCallback } from 'react';
import type { Project } from '../../../../types/project';
import { useProjects } from '../../../../hooks/useProjects';
import { formatDate } from '../../../../utils/coreUtils';

export const useProjectActions = () => {
  const projectsHook = useProjects();

  const deleteProject = useCallback((projectId: string) => {
    if (confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      projectsHook.deleteProject(projectId);
    }
  }, [projectsHook]);

  const duplicateProject = useCallback((project: Project) => {
    const { id, ...projectWithoutId } = project;
    const newProject = {
      ...projectWithoutId,
      client: `${project.client} (복사본)`,
      startDate: formatDate(new Date(), 'iso'),
      endDate: formatDate(new Date(), 'iso')
    };
    projectsHook.addProject(newProject);
  }, [projectsHook]);

  const saveProject = useCallback((
    projectData: Partial<Project>,
    mode: 'create' | 'edit',
    editingProject: Project | null
  ) => {
    if (mode === 'edit' && editingProject) {
      projectsHook.updateProject(editingProject.id, projectData);
    } else {
      projectsHook.addProject(projectData as Omit<Project, 'id'>);
    }
  }, [projectsHook]);

  const refreshProjects = useCallback(async () => {
    try {
      await projectsHook.refreshProjects();
    } catch (error) {
      console.error('Failed to refresh projects:', error);
      throw error;
    }
  }, [projectsHook]);

  return {
    deleteProject,
    duplicateProject,
    saveProject,
    refreshProjects,
    projectsHook,
  };
};