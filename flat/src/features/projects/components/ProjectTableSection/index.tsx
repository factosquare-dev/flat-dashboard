import React, { useEffect, useRef, useMemo } from 'react';
import type { Project } from '../../../../types/project';
import type { ProjectId } from '../../../../types/branded';
import { useDragSelection } from '@/hooks/useDragSelection';
import { getHierarchicalProjectsData, sortHierarchicalProjects } from '@/data/hierarchicalProjects';
import { useProjectTableData } from '@/hooks/useProjectTableData';
import { ProjectTableService } from '@/services/projectTable.service';
import { useProjectTableHandlers } from './useProjectTableHandlers';
import { ProjectTableUI } from './ProjectTableUI';
import { useProjectHierarchy } from '@/hooks/useProjectHierarchy';
import { ProjectType } from '@/types/enums';
import { isProjectType } from '@/utils/projectTypeUtils';

interface ProjectFilters {
  sortField: keyof Project | null;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: keyof Project) => void;
}

interface ProjectTableSectionProps {
  projects: Project[];
  isLoading: boolean;
  hasMore: boolean;
  filters: ProjectFilters;
  hiddenColumns?: Set<string>;
  onEdit: (project: Project) => void;
  onDelete: (projectId: ProjectId) => void;
  onDuplicate: (project: Project) => void;
  onSelectProject: (project: Project) => void;
  onUpdateProject?: <K extends keyof Project>(projectId: ProjectId, field: K, value: Project[K]) => void;
  loadMoreRef: React.RefObject<HTMLDivElement>;
}

const ProjectTableSection: React.FC<ProjectTableSectionProps> = ({
  projects,
  isLoading,
  hasMore,
  filters,
  hiddenColumns = new Set(),
  onEdit,
  onDelete,
  onDuplicate,
  onSelectProject,
  onUpdateProject,
  loadMoreRef
}) => {
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);

  // Extract filter properties first (before using them)
  const sortField = filters?.sortField || null;
  const sortDirection = filters?.sortDirection || 'asc';
  const handleSort = filters?.handleSort || (() => {});

  // Get hierarchical data from filtered projects and apply sorting
  const hierarchicalProjects = useMemo(() => {
    const hierarchical = getHierarchicalProjectsData(projects);
    // Apply sorting while maintaining hierarchy
    return sortHierarchicalProjects(hierarchical, sortField, sortDirection);
  }, [projects, sortField, sortDirection]);

  // Use custom hook for data transformation
  const { allProjects } = useProjectTableData(hierarchicalProjects);

  // Use drag selection hook
  const {
    isDragging,
    handleStartDrag,
    handleMouseEnterItem,
    handleEndDrag,
    handleSelectItem,
    setupAutoScroll
  } = useDragSelection({
    items: projects ?? [],
    selectedItems: selectedRows,
    onSelectionChange: setSelectedRows,
    getItemId: (project) => project.id
  });

  // Use handlers hook
  const {
    showOptionsMenu,
    dropdownPosition,
    handleSelectAllProjects,
    handleSelectRow,
    handleShowOptionsMenu,
    handleEditProject,
    handleDeleteProject,
    handleDuplicateProject,
    setShowOptionsMenu,
    setDropdownPosition,
    // Drag and drop
    isDraggingOver,
    draggedProjectId,
    containerRef,
    handleContainerDrop,
    handleContainerDragOver,
    handleContainerDragLeave,
    setDraggedProjectId
  } = useProjectTableHandlers({
    projects,
    allProjects,
    selectedRows,
    setSelectedRows,
    onEdit,
    onDelete,
    onDuplicate,
    onSelectProject
  });

  // Wrapper to prevent drag selection on Master projects
  const handleStartDragWrapper = (index: number) => {
    const project = projects[index];
    if (project && !ProjectTableService.canStartDragSelection(project)) {
      return;
    }
    handleStartDrag(index);
  };

  const handleMouseEnterRow = (index: number) => {
    if (!projects || index < 0 || index >= projects.length) {
      return;
    }
    const project = projects[index];
    if (project && !ProjectTableService.canStartDragSelection(project)) {
      return;
    }
    handleMouseEnterItem(index);
  };

  // Auto scroll setup
  useEffect(() => {
    return setupAutoScroll(containerRef.current);
  }, [setupAutoScroll]);

  // Close options menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isOptionsMenu = target.closest('.options-menu-dropdown');
      const isOptionsButton = target.closest('.options-menu-button');
      
      // Don't close if clicking inside menu or on the button
      if (!isOptionsMenu && !isOptionsButton) {
        setShowOptionsMenu(null);
        setDropdownPosition(null);
      }
    };
    
    if (showOptionsMenu) {
      // Use setTimeout to ensure this runs after the current event loop
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [showOptionsMenu, setShowOptionsMenu, setDropdownPosition]);

  return (
    <ProjectTableUI
      hierarchicalProjects={hierarchicalProjects}
      projects={projects}
      isLoading={isLoading}
      hasMore={hasMore}
      selectedRows={selectedRows}
      showOptionsMenu={showOptionsMenu}
      dropdownPosition={dropdownPosition}
      containerRef={containerRef}
      isDragging={isDragging}
      sortField={sortField}
      sortDirection={sortDirection}
      hiddenColumns={hiddenColumns}
      loadMoreRef={loadMoreRef}
      onUpdateProject={onUpdateProject}
      handleSort={handleSort}
      handleSelectAllProjects={handleSelectAllProjects}
      handleSelectRow={handleSelectRow}
      handleStartDragWrapper={handleStartDragWrapper}
      handleMouseEnterRow={handleMouseEnterRow}
      handleEndDrag={handleEndDrag}
      handleShowOptionsMenu={handleShowOptionsMenu}
      handleEditProject={handleEditProject}
      handleDeleteProject={handleDeleteProject}
      handleDuplicateProject={handleDuplicateProject}
      onSelectProject={onSelectProject}
      // Drag and drop
      isDraggingOver={isDraggingOver}
      handleContainerDrop={handleContainerDrop}
      handleContainerDragOver={handleContainerDragOver}
      handleContainerDragLeave={handleContainerDragLeave}
      setDraggedProjectId={setDraggedProjectId}
    />
  );
};

export default ProjectTableSection;