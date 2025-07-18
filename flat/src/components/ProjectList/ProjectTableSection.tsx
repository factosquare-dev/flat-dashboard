import React, { useState, useEffect } from 'react';
import type { Project } from '../../types/project';
import ProjectTable from './ProjectTable';
import OptionsMenu from './OptionsMenu';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';

interface ProjectTableSectionProps {
  projects: Project[];
  selectedRows: string[];
  sortField: keyof Project | null;
  sortDirection: 'asc' | 'desc';
  isLoading: boolean;
  hasMore: boolean;
  onSort: (field: keyof Project) => void;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (projectId: string, checked: boolean) => void;
  onSelectProject: (project: Project) => void;
  onUpdateProject: (projectId: string, field: keyof Project, value: any) => void;
  onEditProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onLoadMore: () => void;
}

const ProjectTableSection: React.FC<ProjectTableSectionProps> = ({
  projects,
  selectedRows,
  sortField,
  sortDirection,
  isLoading,
  hasMore,
  onSort,
  onSelectAll,
  onSelectRow,
  onSelectProject,
  onUpdateProject,
  onEditProject,
  onDeleteProject,
  onLoadMore
}) => {
  const [showOptionsMenu, setShowOptionsMenu] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number} | null>(null);
  
  const { observerRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore,
    threshold: 300
  });

  useEffect(() => {
    const handleClickOutside = () => {
      setShowOptionsMenu(null);
    };
    
    if (showOptionsMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showOptionsMenu]);

  const handleSelectAllProjects = (checked: boolean) => {
    if (checked) {
      onSelectAll(true);
    } else {
      onSelectAll(false);
    }
  };

  const handleShowOptionsMenu = (projectId: string, position: { top: number; left: number }) => {
    setDropdownPosition(position);
    setShowOptionsMenu(showOptionsMenu === projectId ? null : projectId);
  };

  const handleEditProject = (projectId: string) => {
    onEditProject(projectId);
    setShowOptionsMenu(null);
  };

  const handleDeleteProject = (projectId: string) => {
    onDeleteProject(projectId);
    setShowOptionsMenu(null);
  };

  return (
    <div className="overflow-x-auto">
      <ProjectTable
        projects={projects}
        selectedRows={selectedRows}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={onSort}
        onSelectAll={handleSelectAllProjects}
        onSelectRow={onSelectRow}
        onSelectProject={onSelectProject}
        onUpdateProject={onUpdateProject}
        onShowOptionsMenu={handleShowOptionsMenu}
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
        <div ref={observerRef} className="h-4" />
      )}
      
      {/* End message */}
      {!hasMore && (
        <div className="text-center py-8 text-gray-500">
          No more projects to load
        </div>
      )}
      
      {showOptionsMenu && dropdownPosition && (
        <OptionsMenu
          projectId={showOptionsMenu}
          position={dropdownPosition}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          onClose={() => setShowOptionsMenu(null)}
        />
      )}
    </div>
  );
};

export default ProjectTableSection;