import React, { useState } from 'react';
import type { Project } from '../../types/project';
import { useProjects } from '../../hooks/useProjects';
import { useProjectFilters } from '../../hooks/useProjectFilters';
import ProjectActions from './ProjectActions';
import ProjectTableSection from './ProjectTableSection';
import ProjectModals from './ProjectModals';

interface ProjectListProps {
  onSelectProject: (project: Project) => void;
  className?: string;
}

const ProjectList: React.FC<ProjectListProps> = ({ onSelectProject, className = '' }) => {
  const projectsHook = useProjects();
  const filtersHook = useProjectFilters();
  
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const filteredProjects = filtersHook.getFilteredAndSortedProjects(projectsHook.projects);

  const handleCreateProject = () => {
    setModalMode('create');
    setEditingProject(null);
    setShowProjectModal(true);
  };

  const handleEditProject = (projectId: string) => {
    const project = projectsHook.projects.find(p => p.id === projectId);
    if (project) {
      setModalMode('edit');
      setEditingProject(project);
      setShowProjectModal(true);
    }
  };

  const handleSaveProject = (projectData: Partial<Project>) => {
    if (modalMode === 'edit' && editingProject) {
      projectsHook.setProjects(
        projectsHook.projects.map(p => 
          p.id === editingProject.id ? { ...p, ...projectData } : p
        )
      );
    } else {
      projectsHook.addProject(projectData);
    }
    setShowProjectModal(false);
    setEditingProject(null);
  };

  const handleSendEmail = () => {
    if (projectsHook.selectedRows.length === 0) {
      alert('이메일을 보낼 공장을 선택해주세요.');
      return;
    }
    setShowEmailModal(true);
  };

  const handleEmailSent = () => {
    setShowEmailModal(false);
    projectsHook.setSelectedRows([]);
  };

  return (
    <>
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-2 py-3">
        <ProjectActions
          selectedPriority={filtersHook.selectedPriority}
          selectedServiceType={filtersHook.selectedServiceType}
          statusFilters={filtersHook.statusFilters}
          onPriorityChange={filtersHook.setSelectedPriority}
          onServiceTypeChange={filtersHook.setSelectedServiceType}
          onStatusFilterToggle={filtersHook.handleStatusFilterToggle}
          onCreateProject={handleCreateProject}
          onSendEmail={handleSendEmail}
        />
      </div>
      
      <ProjectTableSection
        projects={filteredProjects}
        selectedRows={projectsHook.selectedRows}
        sortField={filtersHook.sortField}
        sortDirection={filtersHook.sortDirection}
        isLoading={projectsHook.isLoading}
        hasMore={projectsHook.hasMore}
        onSort={filtersHook.handleSort}
        onSelectAll={projectsHook.handleSelectAll}
        onSelectRow={projectsHook.handleSelectRow}
        onSelectProject={onSelectProject}
        onUpdateProject={projectsHook.updateProject}
        onEditProject={handleEditProject}
        onDeleteProject={projectsHook.deleteProject}
        onLoadMore={projectsHook.loadMoreProjects}
      />
      
      <ProjectModals
        showEmailModal={showEmailModal}
        showProjectModal={showProjectModal}
        modalMode={modalMode}
        editingProject={editingProject}
        availableFactories={projectsHook.getSelectedFactories()}
        onCloseEmailModal={() => setShowEmailModal(false)}
        onCloseProjectModal={() => setShowProjectModal(false)}
        onSaveProject={handleSaveProject}
        onSendEmail={handleEmailSent}
      />
    </>
  );
};

export default ProjectList;