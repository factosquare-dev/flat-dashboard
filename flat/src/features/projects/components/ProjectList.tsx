import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Project } from '../../../types/project';
import { useDynamicLayout } from '@/components/Schedule/hooks/useDynamicLayout';
import { useProjectListState } from './hooks/useProjectListState';
import { useColumnVisibility } from '@/hooks/useColumnVisibility';
import { useColumnOrder } from '@/hooks/useColumnOrder';
import ProjectListLayout from './shared/ProjectListLayout';
import ProjectTableSection from './ProjectTableSection';
import ProjectModals from './ProjectModals';
import { factories } from '@/data/factories';
import { ViewMode } from '@/types/enums';

interface ProjectListProps {
  onSelectProject: (project: Project) => void;
  className?: string;
}

const ProjectList: React.FC<ProjectListProps> = React.memo(({ onSelectProject, className = '' }) => {
  const [searchParams] = useSearchParams();
  const viewMode = searchParams.get('view');
  const isTaskView = viewMode === ViewMode.TASK;
  
  const { containerStyle } = useDynamicLayout();
  const { hiddenColumns, toggleColumn, isColumnVisible, showAllColumns, hideAllColumns } = useColumnVisibility();
  const { columns } = useColumnOrder();
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

  // Memoize filtered and sorted projects
  const filteredProjects = useMemo(() => {
    const filtered = filtersHook.getFilteredAndSortedProjects(projectsHook.projects);
    console.log('[ProjectList] Projects before filter:', projectsHook.projects.length);
    console.log('[ProjectList] Projects after filter:', filtered.length);
    return filtered;
  }, [filtersHook.getFilteredAndSortedProjects, projectsHook.projects]);

  // Memoize layout props to prevent unnecessary re-renders
  const layoutProps = useMemo(() => ({
    containerStyle,
    onRefresh: handleRefresh,
    onSendEmail: handleSendEmail,
    onSearch: handleSearch,
    onCreateProject: handleCreateProject,
    isTaskView,
    selectedPriority: filtersHook.selectedPriority,
    selectedServiceType: filtersHook.selectedServiceType,
    statusFilters: filtersHook.statusFilters,
    searchValue: filtersHook.searchValue,
    dateRange: filtersHook.dateRange,
    totalProjects: projectsHook.projects.length,
    columns,
    hiddenColumns,
    onPriorityChange: filtersHook.setSelectedPriority,
    onServiceTypeChange: filtersHook.setSelectedServiceType,
    onStatusFilterToggle: filtersHook.handleStatusFilterToggle,
    onDateRangeChange: filtersHook.setDateRange,
    onToggleColumn: toggleColumn,
    onShowAllColumns: showAllColumns,
    onHideAllColumns: hideAllColumns,
  }), [
    containerStyle,
    handleRefresh,
    handleSendEmail,
    handleSearch,
    handleCreateProject,
    isTaskView,
    filtersHook.selectedPriority,
    filtersHook.selectedServiceType,
    filtersHook.statusFilters,
    filtersHook.searchValue,
    filtersHook.dateRange,
    projectsHook.projects.length,
    filtersHook.setSelectedPriority,
    filtersHook.setSelectedServiceType,
    filtersHook.handleStatusFilterToggle,
    filtersHook.setDateRange,
    columns,
    hiddenColumns,
    toggleColumn,
    showAllColumns,
    hideAllColumns,
  ]);

  // Memoize table section props
  const tableSectionProps = useMemo(() => ({
    projects: filteredProjects,
    isLoading: projectsHook.isLoading,
    hasMore: projectsHook.hasMore,
    filters: filtersHook,
    hiddenColumns,
    onEdit: handleEditProject,
    onDelete: handleDeleteProject,
    onDuplicate: handleDuplicateProject,
    onSelectProject,
    onUpdateProject: projectsHook.updateProject,
    loadMoreRef: projectsHook.loadMoreRef,
  }), [
    filteredProjects,
    projectsHook.isLoading,
    projectsHook.hasMore,
    filtersHook,
    hiddenColumns,
    handleEditProject,
    handleDeleteProject,
    handleDuplicateProject,
    onSelectProject,
    projectsHook.updateProject,
    projectsHook.loadMoreRef,
  ]);

  // Memoize modal props
  const modalProps = useMemo(() => ({
    showEmailModal,
    showProjectModal,
    modalMode,
    editingProject,
    availableFactories: factories,
    onCloseEmailModal: () => setShowEmailModal(false),
    onCloseProjectModal: () => setShowProjectModal(false),
    onSaveProject: handleSaveProject,
    onSendEmail: () => setShowEmailModal(false),
  }), [
    showEmailModal,
    showProjectModal,
    modalMode,
    editingProject,
    setShowEmailModal,
    setShowProjectModal,
    handleSaveProject,
  ]);

  return (
    <>
      <ProjectListLayout {...layoutProps}>
        <ProjectTableSection {...tableSectionProps} />
      </ProjectListLayout>
      
      <ProjectModals {...modalProps} />
    </>
  );
});

ProjectList.displayName = 'ProjectList';

export default ProjectList;