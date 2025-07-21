import React, { useState, useEffect, useRef } from 'react';
import type { Project } from '../../types/project';
import ProjectTable from './ProjectTable';
import OptionsMenu from './OptionsMenu';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useDragSelection } from '../../hooks/useDragSelection';

interface ProjectTableSectionProps {
  projects: Project[];
  isLoading: boolean;
  hasMore: boolean;
  filters: any;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onDuplicate: (project: Project) => void;
  onSelectProject: (project: Project) => void;
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void;
  loadMoreRef: any;
}

const ProjectTableSection: React.FC<ProjectTableSectionProps> = ({
  projects,
  isLoading,
  hasMore,
  filters,
  onEdit,
  onDelete,
  onDuplicate,
  onSelectProject,
  onUpdateProject,
  loadMoreRef
}) => {
  const [showOptionsMenu, setShowOptionsMenu] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number} | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const sortField = filters?.sortField || null;
  const sortDirection = filters?.sortDirection || 'asc';
  const handleSort = filters?.handleSort || (() => {});

  const {
    isDragging,
    handleStartDrag,
    handleMouseEnterItem,
    handleEndDrag,
    handleSelectItem,
    setupAutoScroll
  } = useDragSelection({
    items: projects || [],
    selectedItems: selectedRows,
    onSelectionChange: setSelectedRows,
    getItemId: (project) => project.id
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isOptionsMenu = target.closest('.options-menu-dropdown');
      
      if (!isOptionsMenu) {
        setShowOptionsMenu(null);
        setDropdownPosition(null);
      }
    };
    
    if (showOptionsMenu) {
      // Add event listener immediately to capture all clicks
      document.addEventListener('click', handleClickOutside, true);
      
      return () => document.removeEventListener('click', handleClickOutside, true);
    }
  }, [showOptionsMenu]);

  const handleSelectAllProjects = (checked: boolean) => {
    if (checked) {
      setSelectedRows(projects?.map(p => p.id) || []);
    } else {
      setSelectedRows([]);
    }
  };
  
  const handleSelectRow = (projectId: string, checked: boolean, index?: number) => {
    console.log('handleSelectRow called:', { projectId, checked, index });
    handleSelectItem(projectId, checked);
  };

  const handleMouseEnterRow = (index: number) => {
    handleMouseEnterItem(index);
  };

  // 자동 스크롤 기능
  useEffect(() => {
    return setupAutoScroll(containerRef.current);
  }, [setupAutoScroll]);

  const handleShowOptionsMenu = (projectId: string, position: { top: number; left: number }) => {
    if (showOptionsMenu === projectId) {
      setShowOptionsMenu(null);
      setDropdownPosition(null);
    } else {
      setDropdownPosition(position);
      setShowOptionsMenu(projectId);
    }
  };

  const handleEditProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      onEdit(project);
      setShowOptionsMenu(null);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    onDelete(projectId);
    setShowOptionsMenu(null);
  };
  
  const handleDuplicateProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      onDuplicate(project);
      setShowOptionsMenu(null);
    }
  };
  
  const handleUpdateProject = (projectId: string, field: keyof Project, value: any) => {
    if (onUpdateProject) {
      onUpdateProject(projectId, { [field]: value });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 project-table-container"
        onMouseUp={handleEndDrag}
        onMouseLeave={handleEndDrag}
      >
        <ProjectTable
          projects={projects || []}
          selectedRows={selectedRows}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onSelectAll={handleSelectAllProjects}
          onSelectRow={handleSelectRow}
          onSelectProject={onSelectProject}
          onUpdateProject={handleUpdateProject}
          onShowOptionsMenu={handleShowOptionsMenu}
          onMouseEnterRow={handleMouseEnterRow}
          isDragging={isDragging}
          onStartDrag={handleStartDrag}
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading more projects...</span>
          </div>
        )}
        
        {/* Infinite scroll trigger */}
        {hasMore && !isLoading && (
          <div ref={loadMoreRef} className="h-4" />
        )}
        
        {/* End message */}
        {!hasMore && (
          <div className="text-center py-8 text-gray-500">
            No more projects to load
          </div>
        )}
      </div>
      
      {showOptionsMenu && dropdownPosition && (
        <OptionsMenu
          projectId={showOptionsMenu}
          position={dropdownPosition}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          onDuplicate={handleDuplicateProject}
          onClose={() => setShowOptionsMenu(null)}
        />
      )}
    </div>
  );
};

export default ProjectTableSection;