import React from 'react';
import type { Project } from '../../../types/project';
import { useDynamicLayout } from '../../../components/Schedule/hooks/useDynamicLayout';
import { useProjectListState } from './hooks/useProjectListState';
import ProjectListLayout from './components/ProjectListLayout';
import ProjectTableSection from './ProjectTableSection';
import ProjectModals from './ProjectModals';
import { factories } from '../../../data/factories';

interface ProjectListProps {
  onSelectProject: (project: Project) => void;
  className?: string;
}

const ProjectList: React.FC<ProjectListProps> = React.memo(({ onSelectProject, className = '' }) => {
  const { containerStyle } = useDynamicLayout();
  const {
    showEmailModal,
    setShowEmailModal,
    showProjectModal,
    setShowProjectModal,
    modalMode,
    editingProject,
    handleCreateProject,
    handleEditProject,
    handleDeleteProject,
    handleDuplicateProject,
    handleSaveProject,
    handleRefresh,
    handleSendEmail,
    handleSearch,
    projectsHook,
    filtersHook
  } = useProjectListState();

  return (
    <>
      <ProjectListLayout
        containerStyle={containerStyle}
        onRefresh={handleRefresh}
        onSendEmail={handleSendEmail}
        onSearch={handleSearch}
        onCreateProject={handleCreateProject}
        selectedPriority={filtersHook.selectedPriority}
        selectedServiceType={filtersHook.selectedServiceType}
        statusFilters={filtersHook.statusFilters}
        searchValue={filtersHook.searchValue}
        dateRange={filtersHook.dateRange}
        totalProjects={projectsHook.projects.length}
        onPriorityChange={filtersHook.setSelectedPriority}
        onServiceTypeChange={filtersHook.setSelectedServiceType}
        onStatusFilterToggle={filtersHook.handleStatusFilterToggle}
        onDateRangeChange={filtersHook.setDateRange}
      >
        <ProjectTableSection
          projects={filtersHook.getFilteredAndSortedProjects(projectsHook.projects)}
          isLoading={projectsHook.isLoading}
          hasMore={projectsHook.hasMore}
          filters={filtersHook}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          onDuplicate={handleDuplicateProject}
          onSelectProject={onSelectProject}
          onUpdateProject={projectsHook.updateProjectBatch}
          loadMoreRef={projectsHook.loadMoreRef}
        />
      </ProjectListLayout>
      
      <ProjectModals
        showEmailModal={showEmailModal}
        showProjectModal={showProjectModal}
        modalMode={modalMode}
        editingProject={editingProject}
        availableFactories={factories}
        onCloseEmailModal={() => setShowEmailModal(false)}
        onCloseProjectModal={() => setShowProjectModal(false)}
        onSaveProject={handleSaveProject}
        onSendEmail={() => setShowEmailModal(false)}
      />
    </>
  );
});

ProjectList.displayName = 'ProjectList';

export default ProjectList;