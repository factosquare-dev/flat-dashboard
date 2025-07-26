import { useState, useCallback } from 'react';
import type { Project } from '@/types/project';
import { useProjectFilters } from '@/hooks/useProjectFilters';
import { useProjectModal } from './useProjectModal';
import { useProjectActions } from './useProjectActions';

export const useProjectListState = () => {
  const filtersHook = useProjectFilters();
  const projectModal = useProjectModal();
  const projectActions = useProjectActions();
  
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleCreateProject = useCallback(() => {
    projectModal.openCreateModal();
  }, [projectModal]);

  const handleEditProject = useCallback((project: Project) => {
    projectModal.openEditModal(project);
  }, [projectModal]);

  const handleDeleteProject = useCallback((projectId: string) => {
    projectActions.deleteProject(projectId);
  }, [projectActions]);

  const handleDuplicateProject = useCallback((project: Project) => {
    projectActions.duplicateProject(project);
  }, [projectActions]);

  const handleSaveProject = useCallback((projectData: Partial<Project>) => {
    projectActions.saveProject(projectData, projectModal.modalMode, projectModal.editingProject);
    projectModal.closeModal();
  }, [projectActions, projectModal]);

  const handleRefresh = useCallback(async () => {
    await projectActions.refreshProjects();
  }, [projectActions]);

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
    showProjectModal: projectModal.showProjectModal,
    setShowProjectModal: projectModal.setShowProjectModal,
    modalMode: projectModal.modalMode,
    editingProject: projectModal.editingProject,
    
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
    projectsHook: projectActions.projectsHook,
    filtersHook
  };
};