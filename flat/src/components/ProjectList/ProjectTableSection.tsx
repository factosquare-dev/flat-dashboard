import React, { useState, useEffect } from 'react';
import type { Project } from '../../types/project';
import ProjectTable from './ProjectTable';
import OptionsMenu from './OptionsMenu';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';

interface ProjectTableSectionProps {
  projects: Project[];
  isLoading: boolean;
  hasMore: boolean;
  filters: any;
  onEdit: (projectId: string) => void;
  onDelete: (projectId: string) => void;
  onDuplicate: (projectId: string) => void;
  onSelectProject: (project: Project) => void;
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
  loadMoreRef
}) => {
  const [showOptionsMenu, setShowOptionsMenu] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number} | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  
  const sortField = filters?.sortField || null;
  const sortDirection = filters?.sortDirection || 'asc';
  const handleSort = filters?.handleSort || (() => {});

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
      setSelectedRows(projects?.map(p => p.id) || []);
    } else {
      setSelectedRows([]);
    }
  };
  
  const handleSelectRow = (projectId: string, checked: boolean) => {
    if (checked) {
      setSelectedRows(prev => [...prev, projectId]);
    } else {
      setSelectedRows(prev => prev.filter(id => id !== projectId));
    }
  };

  const handleShowOptionsMenu = (projectId: string, position: { top: number; left: number }) => {
    setDropdownPosition(position);
    setShowOptionsMenu(showOptionsMenu === projectId ? null : projectId);
  };

  const handleEditProject = (projectId: string) => {
    onEdit(projectId);
    setShowOptionsMenu(null);
  };

  const handleDeleteProject = (projectId: string) => {
    onDelete(projectId);
    setShowOptionsMenu(null);
  };
  
  const handleDuplicateProject = (projectId: string) => {
    onDuplicate(projectId);
    setShowOptionsMenu(null);
  };
  
  const handleUpdateProject = (projectId: string, field: keyof Project, value: any) => {
    // TODO: Implement update logic
    console.log('Update project:', projectId, field, value);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
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