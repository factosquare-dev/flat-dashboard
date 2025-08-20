import React from 'react';
import type { Project, HierarchicalProject } from '@/shared/types/project';
import type { ProjectId } from '@/shared/types/branded';
import DraggableProjectTable from '../DraggableProjectTable';
import HierarchicalProjectTable from '../HierarchicalProjectTable';
import OptionsMenu from '../OptionsMenu';
import LoadingIndicator from '../shared/LoadingIndicator';
import InfiniteScrollTrigger from '../shared/InfiniteScrollTrigger';

interface ProjectTableUIProps {
  hierarchicalProjects: HierarchicalProject[];
  projects: Project[];
  isLoading: boolean;
  hasMore: boolean;
  selectedRows: string[];
  showOptionsMenu: string | null;
  dropdownPosition: { top: number; left: number } | null;
  containerRef: React.RefObject<HTMLDivElement>;
  isDragging: boolean;
  sortField: keyof Project | null;
  sortDirection: 'asc' | 'desc';
  hiddenColumns: Set<string>;
  loadMoreRef: React.RefObject<HTMLDivElement>;
  onUpdateProject?: <K extends keyof Project>(projectId: ProjectId, field: K, value: Project[K]) => void;
  handleSort: (field: keyof Project) => void;
  handleSelectAllProjects: (checked: boolean) => void;
  handleSelectRow: (projectId: string, checked: boolean) => void;
  handleStartDragWrapper: (index: number) => void;
  handleMouseEnterRow: (index: number) => void;
  handleEndDrag: () => void;
  handleShowOptionsMenu: (projectId: string, position: { top: number; left: number }, event?: React.MouseEvent) => void;
  handleEditProject: (projectId: ProjectId) => void;
  handleDeleteProject: (projectId: ProjectId) => void;
  handleDuplicateProject: (projectId: ProjectId) => void;
  onSelectProject: (project: Project) => void;
  // Drag and drop
  isDraggingOver: boolean;
  handleContainerDrop: (e: React.DragEvent) => void;
  handleContainerDragOver: (e: React.DragEvent) => void;
  handleContainerDragLeave: (e: React.DragEvent) => void;
  setDraggedProjectId: (id: string | null) => void;
}

export const ProjectTableUI: React.FC<ProjectTableUIProps> = ({
  hierarchicalProjects,
  projects,
  isLoading,
  hasMore,
  selectedRows,
  showOptionsMenu,
  dropdownPosition,
  containerRef,
  isDragging,
  sortField,
  sortDirection,
  hiddenColumns,
  loadMoreRef,
  onUpdateProject,
  handleSort,
  handleSelectAllProjects,
  handleSelectRow,
  handleStartDragWrapper,
  handleMouseEnterRow,
  handleEndDrag,
  handleShowOptionsMenu,
  handleEditProject,
  handleDeleteProject,
  handleDuplicateProject,
  onSelectProject,
  // Drag and drop
  isDraggingOver,
  handleContainerDrop,
  handleContainerDragOver,
  handleContainerDragLeave,
  setDraggedProjectId
}) => {
  return (
    <>
      <div 
        ref={containerRef}
        className="h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
        onDrop={handleContainerDrop}
        onDragOver={handleContainerDragOver}
        onDragLeave={handleContainerDragLeave}
      >
        <HierarchicalProjectTable
          projects={hierarchicalProjects}
          selectedRows={selectedRows}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAllProjects}
          showOptionsMenu={showOptionsMenu}
          onShowOptionsMenu={handleShowOptionsMenu}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          isDragging={isDragging}
          onStartDrag={handleStartDragWrapper}
          onMouseEnterRow={handleMouseEnterRow}
          onEndDrag={handleEndDrag}
          onUpdateProject={onUpdateProject}
          onSelectProject={onSelectProject}
          hiddenColumns={hiddenColumns}
          dropdownPosition={dropdownPosition}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          onDuplicate={handleDuplicateProject}
          onDragStart={(projectId: string) => setDraggedProjectId(projectId)}
          onDragEnd={() => setDraggedProjectId(null)}
        />

        {/* Loading indicator for fetching more projects */}
        {isLoading && <LoadingIndicator />}

        {/* Infinite scroll trigger */}
        <InfiniteScrollTrigger 
          hasMore={hasMore}
          isLoading={isLoading}
          loadMoreRef={loadMoreRef}
          totalItems={projects.length}
        />
      </div>

      {/* Options menu dropdown for project actions */}
      {showOptionsMenu && dropdownPosition && (
        <OptionsMenu
          projectId={showOptionsMenu as ProjectId}
          position={dropdownPosition}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          onDuplicate={handleDuplicateProject}
          onClose={() => handleShowOptionsMenu('', { top: 0, left: 0 })}
        />
      )}
    </>
  );
};