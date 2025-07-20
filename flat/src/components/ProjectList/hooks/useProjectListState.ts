import { useState } from 'react';
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

  const handleCreateProject = () => {
    setModalMode('create');
    setEditingProject(null);
    setShowProjectModal(true);
  };

  const handleEditProject = (project: Project) => {
    setModalMode('edit');
    setEditingProject(project);
    setShowProjectModal(true);
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      projectsHook.deleteProject(projectId);
    }
  };

  const handleDuplicateProject = (project: Project) => {
    const newProject = {
      ...project,
      id: undefined,
      name: `${project.name} (복사본)`,
      createdAt: new Date().toISOString()
    };
    projectsHook.createProject(newProject);
  };

  const handleSaveProject = (projectData: Partial<Project>) => {
    if (modalMode === 'edit' && editingProject) {
      projectsHook.updateProject(editingProject.id, projectData);
    } else {
      projectsHook.createProject(projectData as Omit<Project, 'id'>);
    }
    setShowProjectModal(false);
  };

  const handleRefresh = () => {
    console.log('Refreshing projects...');
    // Add refresh logic here if needed
  };

  const handleSendEmail = () => {
    setShowEmailModal(true);
  };

  const handleSearch = (query: string) => {
    filtersHook.setSearchQuery(query);
  };

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