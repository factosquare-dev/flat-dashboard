/**
 * Project actions hook - handles CRUD operations
 */

import { useCallback } from 'react';
import type { Project } from '@/types/project';
import type { ProjectId } from '@/types/branded';
import { useProjects } from '@/hooks/useProjects';
import { ProjectTableService } from '@/services/projectTable.service';

export const useProjectActions = () => {
  const projectsHook = useProjects();

  const deleteProject = useCallback((projectId: ProjectId) => {
    if (confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      projectsHook.deleteProject(projectId);
    }
  }, [projectsHook]);

  const duplicateProject = useCallback((project: Project) => {
    try {
      const { masterProject, subProjects, newMasterId } = ProjectTableService.prepareDuplicateProject(project);
      
      // Add the master project with the specified ID if it's a Master type
      if (newMasterId) {
        projectsHook.addProject({ ...masterProject, id: newMasterId });
        
        // Add all SUB projects with staggered timing to avoid ID conflicts
        subProjects.forEach((subProject, index) => {
          setTimeout(() => {
            projectsHook.addProject(subProject);
          }, 100 * (index + 1));
        });
      } else {
        // Regular project duplication
        projectsHook.addProject(masterProject);
      }
    } catch (error) {
      console.error('[useProjectActions] Error duplicating project:', error);
      // Fallback: basic duplication without cascade
      const { id, ...projectWithoutId } = project;
      projectsHook.addProject(projectWithoutId);
    }
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