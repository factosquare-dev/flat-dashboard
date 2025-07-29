import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Project } from '../../../types/project';
import type { Priority, ServiceType, ProjectStatus } from '../../../types/project';
import type { ProjectId } from '../../../types/branded';
import DraggableProjectTable from './DraggableProjectTable';
import HierarchicalProjectTable from './HierarchicalProjectTable';
import OptionsMenu from './OptionsMenu';
import LoadingIndicator from './shared/LoadingIndicator';
import InfiniteScrollTrigger from './shared/InfiniteScrollTrigger';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import { useDragSelection } from '../../../hooks/useDragSelection';
import { getHierarchicalProjectsData } from '../../../data/hierarchicalProjects';
import { useProjectHierarchy } from '../../../hooks/useProjectHierarchy';
import { ProjectType } from '../../../types/enums';
import { isProjectType } from '../../../utils/projectTypeUtils';

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
  const [showOptionsMenu, setShowOptionsMenu] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number} | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { makeIndependent } = useProjectHierarchy();
  
  // 계층형 데이터에서 모든 프로젝트를 평면화하여 가져오기
  const allProjects = useMemo(() => {
    const hierarchicalData = getHierarchicalProjectsData();
    const flattened: Project[] = [];
    
    const flatten = (items: Project[]) => {
      items.forEach(item => {
        flattened.push(item);
        if (item.children) {
          flatten(item.children);
        }
      });
    };
    
    flatten(hierarchicalData);
    return flattened;
  }, [projects]); // projects가 변경될 때마다 재계산
  
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
    items: projects ?? [],
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
      setSelectedRows(projects?.map(p => p.id) ?? []);
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

  const handleEditProject = (projectId: ProjectId) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      onEdit(project);
      setShowOptionsMenu(null);
    }
  };

  const handleDeleteProject = (projectId: ProjectId) => {
    onDelete(projectId);
    setShowOptionsMenu(null);
  };
  
  const handleDuplicateProject = (projectId: ProjectId) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      onDuplicate(project);
      setShowOptionsMenu(null);
    }
  };
  
  const handleUpdateProject = <K extends keyof Project>(projectId: ProjectId, field: K, value: Project[K]) => {
    console.log('[ProjectTableSection] handleUpdateProject called:', { projectId, field, value });
    if (onUpdateProject) {
      onUpdateProject(projectId, field, value);
    } else {
      console.error('[ProjectTableSection] onUpdateProject is not defined!');
    }
  };


  const handleContainerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    // 케이스 1: 프로젝트 ID 확인
    const projectId = e.dataTransfer.getData('projectId');
    if (!projectId) {
      return;
    }
    
    // 케이스 2: 프로젝트 정보 가져오기
    const draggedProject = allProjects.find(p => p.id === projectId);
    if (!draggedProject) {
      return;
    }
    
    // 케이스 3: SUB 프로젝트가 아니면 무시
    if (!isProjectType(draggedProject.type, ProjectType.SUB)) {
      return;
    }
    
    // 케이스 4: 이미 독립 프로젝트면 무시
    if (!draggedProject.parentId) {
      return;
    }
    
    // 케이스 5: 드롭 위치 확인
    const target = e.target as HTMLElement;
    const projectRow = target.closest('tr[role="row"]');
    
    if (projectRow) {
      const targetProjectId = projectRow.getAttribute('data-id');
      if (targetProjectId) {
        const targetProject = allProjects.find(p => p.id === targetProjectId);
        
        if (targetProject) {
          // 케이스 1: MASTER 프로젝트에 드롭
          // 이 경우는 이미 DraggableProjectTable에서 처리되었을 것임 (stopPropagation 때문에 여기까지 안 옴)
          // 하지만 혹시 모르니 체크
          if (isProjectType(targetProject.type, ProjectType.MASTER)) {
            return;
          }
          
          // 케이스 2: 같은 MASTER 내의 SUB에 드롭 -> 아무 동작 안함
          if (isProjectType(targetProject.type, ProjectType.SUB) && targetProject.parentId) {
            if (draggedProject.parentId === targetProject.parentId) {
              return;
            }
          }
          
          // 케이스 3: 독립 SUB 또는 다른 MASTER의 SUB에 드롭 -> 독립 프로젝트로
          makeIndependent(projectId);
        }
      }
    } else {
      // 빈 공간에 드롭하면 독립 프로젝트로 만들기
      makeIndependent(projectId);
    }
  };

  const handleContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    
    // 케이스 1: 드래그 중인 프로젝트가 없으면 무시
    if (!draggedProjectId) {
      return;
    }
    
    // 케이스 2: 드래그 중인 프로젝트 정보 가져오기
    const draggedProject = allProjects.find(p => p.id === draggedProjectId);
    if (!draggedProject) {
      return;
    }
    
    // 케이스 3: SUB 프로젝트가 아니면 드롭 영역 표시 안함
    if (!isProjectType(draggedProject.type, ProjectType.SUB)) {
      setIsDraggingOver(false);
      return;
    }
    
    // 케이스 4: 이미 독립 프로젝트인 SUB는 드롭 영역 표시 안함
    if (!draggedProject.parentId) {
      setIsDraggingOver(false);
      return;
    }
    
    // 케이스 5: MASTER 안의 SUB 프로젝트를 드래그하는 경우
    // 드롭 위치 확인
    const target = e.target as HTMLElement;
    const projectRow = target.closest('tr[role="row"]');
    
    // 드롭 위치가 프로젝트 행인 경우, 해당 프로젝트 확인
    if (projectRow) {
      const projectId = projectRow.getAttribute('data-id');
      if (projectId) {
        const targetProject = allProjects.find(p => p.id === projectId);
        // MASTER 프로젝트 위가 아니면 드롭 가능
        if (targetProject && !isProjectType(targetProject.type, ProjectType.MASTER)) {
          e.dataTransfer.dropEffect = 'move';
          setIsDraggingOver(true);
          return;
        }
      }
      // MASTER 위면 드롭 불가
      e.dataTransfer.dropEffect = 'none';
      setIsDraggingOver(false);
    } else {
      // 빈 공간이면 항상 드롭 가능
      e.dataTransfer.dropEffect = 'move';
      setIsDraggingOver(true);
    }
  };

  const handleContainerDragLeave = (e: React.DragEvent) => {
    // 컨테이너를 완전히 벗어날 때만 처리
    const relatedTarget = e.relatedTarget as HTMLElement;
    
    // 컨테이너 내부의 다른 요소로 이동하는 경우는 무시
    if (containerRef.current && containerRef.current.contains(relatedTarget)) {
      return;
    }
    
    setIsDraggingOver(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div 
        ref={containerRef}
        className={`flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 project-table-container ${
          isDraggingOver ? 'bg-blue-50' : ''
        }`}
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
          hiddenColumns={hiddenColumns}
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
        
        {isDraggingOver && (
          <div className="text-center py-4 text-blue-600 bg-blue-50 border-2 border-dashed border-blue-300 mx-4 my-2 rounded-lg">
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