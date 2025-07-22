import { useState, useCallback } from 'react';
import type { Project } from '../../../types/project';
import { useProjects } from '../../../hooks/useProjects';
import { useProjectFilters } from '../../../hooks/useProjectFilters';

export const useProjectListState = () => {
  const projectsHook = useProjects();
  const filtersHook = useProjectFilters();
  
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleCreateProject = useCallback(() => {
    setModalMode('create');
    setEditingProject(null);
    setShowProjectModal(true);
  }, []);

  const handleEditProject = useCallback((project: Project) => {
    setModalMode('edit');
    setEditingProject(project);
    setShowProjectModal(true);
  }, []);

  const handleDeleteProject = useCallback((projectId: string) => {
    if (confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      projectsHook.deleteProject(projectId);
    }
  }, [projectsHook]);

  const handleDuplicateProject = useCallback((project: Project) => {
    const { id, ...projectWithoutId } = project;
    const newProject = {
      ...projectWithoutId,
      client: `${project.client} (복사본)`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    };
    projectsHook.addProject(newProject);
  }, [projectsHook]);

  const handleSaveProject = useCallback((projectData: Partial<Project>) => {
    if (modalMode === 'edit' && editingProject) {
      projectsHook.updateProject(editingProject.id, projectData);
    } else {
      projectsHook.addProject(projectData as Omit<Project, 'id'>);
    }
    setShowProjectModal(false);
  }, [modalMode, editingProject, projectsHook]);

  const handleRefresh = useCallback(async () => {
    try {
      await projectsHook.refreshProjects();
    } catch (error) {
      console.error('Failed to refresh projects:', error);
    }
  }, [projectsHook]);

  const handleSendEmail = useCallback(() => {
    setShowEmailModal(true);
  }, []);

  const handleSearch = useCallback((query: string) => {
    filtersHook.setSearchValue(query);
  }, [filtersHook]);

  return {
    // State
    showEmailModal,
    setShowEmailModal,
    showProjectModal,
    setShowProjectModal,
    modalMode,
    editingProject,
    
    // Handlers
    handleCreateProject,
    handleEditProject,
    handleDeleteProject,
    handleDuplicateProject,
    handleSaveProject,
    handleRefresh,
    handleSendEmail,
    handleSearch,
    
    // Hooks
    projectsHook,
    filtersHook
  };
};