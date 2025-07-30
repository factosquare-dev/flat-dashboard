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
  
  const { makeIndependent, moveToMaster } = useProjectHierarchy();
  
  // 계층형 데이터를 메모이제이션
  const hierarchicalProjects = useMemo(() => {
    console.log('[ProjectTableSection] Getting hierarchical projects data');
    return getHierarchicalProjectsData();
  }, [projects]); // projects가 변경될 때만 재계산
  
  // 계층형 데이터에서 모든 프로젝트를 평면화하여 가져오기
  const allProjects = useMemo(() => {
    const flattened: Project[] = [];
    
    const flatten = (items: Project[]) => {
      items.forEach(item => {
        flattened.push(item);
        if (item.children) {
          flatten(item.children);
        }
      });
    };
    
    flatten(hierarchicalProjects);
    return flattened;
  }, [hierarchicalProjects]);
  
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
  
  // Wrapper to prevent drag selection on Master projects
  const handleStartDragWrapper = (index: number) => {
    const project = projects[index];
    if (project && isProjectType(project.type, ProjectType.MASTER)) {
      return; // Don't start drag selection on Master projects
    }
    handleStartDrag(index);
  };
  
  const handleSelectRow = (projectId: string, checked: boolean, index?: number) => {
    handleSelectItem(projectId, checked);
  };

  const handleMouseEnterRow = (index: number) => {
    // Master 프로젝트는 드래그 선택에서 제외
    const project = projects[index];
    if (project && isProjectType(project.type, ProjectType.MASTER)) {
      return;
    }
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
    // 이벤트가 이미 처리되었는지 확인
    if (e.defaultPrevented) {
      setIsDraggingOver(false);
      return;
    }
    
    const projectId = e.dataTransfer.getData('projectId');
    if (!projectId) {
      return;
    }
    
    const draggedProject = allProjects.find(p => p.id === projectId);
    if (!draggedProject || !isProjectType(draggedProject.type, ProjectType.SUB)) {
      return;
    }
    
    // 드롭 위치 확인
    const target = e.target as HTMLElement;
    const droppedOnRow = target.closest('tr[role="row"]');
    
    if (droppedOnRow) {
      const targetProjectId = droppedOnRow.getAttribute('data-id');
      if (targetProjectId) {
        const targetProject = allProjects.find(p => p.id === targetProjectId);
        
        if (targetProject && isProjectType(targetProject.type, ProjectType.MASTER)) {
          // MASTER에 드롭 - 여기서 직접 처리
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingOver(false);
          
          // 같은 부모가 아닌 경우에만 이동
          if (draggedProject.parentId !== targetProjectId) {
            moveToMaster(projectId, targetProjectId);
          }
          return;
        }
        
        // 같은 MASTER 내의 SUB에 드롭한 경우
        if (targetProject && isProjectType(targetProject.type, ProjectType.SUB) && 
            targetProject.parentId && draggedProject.parentId === targetProject.parentId) {
          e.preventDefault();
          setIsDraggingOver(false);
          return; // 아무 동작 안함
        }
      }
    }
    
    // 빈 공간이나 독립 프로젝트로 만들 수 있는 위치에 드롭
    if (draggedProject.parentId) {
      e.preventDefault();
      setIsDraggingOver(false);
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
        // MASTER 프로젝트 위면 드롭 가능
        if (targetProject && isProjectType(targetProject.type, ProjectType.MASTER)) {
          e.dataTransfer.dropEffect = 'move';
          setIsDraggingOver(false); // MASTER에 드롭할 때는 독립 영역 표시 안함
          return;
        }
      }
      // MASTER가 아닌 곳에 드롭하면 독립 영역 표시
      e.dataTransfer.dropEffect = 'move';
      setIsDraggingOver(true);
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
        onDragEnter={(e) => e.preventDefault()}
      >
        {/* 계층형 프로젝트 테이블 */}
        <HierarchicalProjectTable
          projects={hierarchicalProjects}
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