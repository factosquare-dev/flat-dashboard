import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Project } from '../../../types/project';
import type { Priority, ServiceType, ProjectStatus } from '../../../types/project';
import DraggableProjectTable from './DraggableProjectTable';
import HierarchicalProjectTable from './HierarchicalProjectTable';
import OptionsMenu from './OptionsMenu';
import LoadingIndicator from './shared/LoadingIndicator';
import InfiniteScrollTrigger from './shared/InfiniteScrollTrigger';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import { useDragSelection } from '../../../hooks/useDragSelection';
import { getHierarchicalProjectsData } from '../../../data/hierarchicalProjects';
import { useProjectHierarchy } from '../../../hooks/useProjectHierarchy';

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
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onDuplicate: (project: Project) => void;
  onSelectProject: (project: Project) => void;
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void;
  loadMoreRef: React.RefObject<HTMLDivElement>;
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
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { makeIndependent } = useProjectHierarchy();
  
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
    handleSelectItem(projectId, checked);
  };

  const handleMouseEnterRow = (index: number) => {
    handleMouseEnterItem(index);
  };

  // 자동 스크롤 기능
  useEffect(() => {
    return setupAutoScroll(containerRef.current);
  }, [setupAutoScroll]);

  const handleShowOptionsMenu = (projectId: string, position: { top: number; left: number }, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
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


  const handleContainerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('projectId');
    
    // 컨테이너에 직접 드롭됐다면 (MASTER 프로젝트가 아닌 곳) 독립 프로젝트로
    if (projectId) {
      makeIndependent(projectId);
    }
    setIsDraggingOver(false);
  };

  const handleContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    
    // 현재 드래그 중인 프로젝트 확인
    if (draggedProjectId) {
      const draggedProject = projects.find(p => p.id === draggedProjectId);
      // 이미 독립 프로젝트(parentId가 null)인 경우에는 드롭 영역 표시하지 않음
      if (draggedProject && draggedProject.parentId === null) {
        e.dataTransfer.dropEffect = 'none';
        return;
      }
    }
    
    e.dataTransfer.dropEffect = 'move';
    setIsDraggingOver(true);
  };

  const handleContainerDragLeave = (e: React.DragEvent) => {
    // 컨테이너를 벗어날 때만 처리
    if (e.currentTarget === e.target) {
      setIsDraggingOver(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 project-table-container"
        onMouseUp={handleEndDrag}
        onMouseLeave={handleEndDrag}
        onDrop={handleContainerDrop}
        onDragOver={handleContainerDragOver}
        onDragLeave={handleContainerDragLeave}
      >
        {/* 계층형 프로젝트 테이블 */}
        <HierarchicalProjectTable
          projects={getHierarchicalProjectsData()}
          selectedRows={selectedRows}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onSelectAll={handleSelectAllProjects}
          onSelectRow={handleSelectRow}
          onSelectProject={onSelectProject}
          onUpdateProject={handleUpdateProject}
          onShowOptionsMenu={handleShowOptionsMenu}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          onDuplicate={handleDuplicateProject}
          onDragStart={(projectId: string) => setDraggedProjectId(projectId)}
          onDragEnd={() => setDraggedProjectId(null)}
        />
        
        <LoadingIndicator isLoading={isLoading} />
        
        <InfiniteScrollTrigger 
          hasMore={hasMore}
          isLoading={isLoading}
          loadMoreRef={loadMoreRef}
        />
        
        {isDraggingOver && !hasMore && (
          <div className="text-center py-4 text-blue-600">
            <p className="font-medium">
              여기에 놓아 독립 프로젝트로 만들기
            </p>
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