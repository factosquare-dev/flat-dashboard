/**
 * Project actions hook - handles CRUD operations
 */

import { useCallback } from 'react';
import type { Project } from '@/types/project';
import type { ProjectId } from '@/types/branded';
import { useProjects } from '@/hooks/useProjects';
import { toLocalDateString } from '@/utils/unifiedDateUtils';

export const useProjectActions = () => {
  const projectsHook = useProjects();

  const deleteProject = useCallback((projectId: ProjectId) => {
    if (confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      projectsHook.deleteProject(projectId);
    }
  }, [projectsHook]);

  const duplicateProject = useCallback((project: Project) => {
    const { id, ...projectWithoutId } = project;
    const newProject = {
      ...projectWithoutId,
      client: `${project.client} (복사본)`,
      startDate: toLocalDateString(new Date()),
      endDate: toLocalDateString(new Date())
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