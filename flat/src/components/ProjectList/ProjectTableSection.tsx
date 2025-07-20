import React, { useState, useEffect, useRef } from 'react';
import type { Project } from '../../types/project';
import ProjectTable from './ProjectTable';
import OptionsMenu from './OptionsMenu';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';

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
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartIndex, setDragStartIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const sortField = filters?.sortField || null;
  const sortDirection = filters?.sortDirection || 'asc';
  const handleSort = filters?.handleSort || (() => {});

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
    // 드래그 시작
    if (checked && !isDragging && index !== undefined) {
      setIsDragging(true);
      setDragStartIndex(index);
    }

    if (checked) {
      setSelectedRows(prev => [...prev, projectId]);
    } else {
      setSelectedRows(prev => prev.filter(id => id !== projectId));
    }
  };

  const handleMouseEnterRow = (index: number) => {
    if (isDragging && dragStartIndex !== null) {
      const start = Math.min(dragStartIndex, index);
      const end = Math.max(dragStartIndex, index);
      
      const newSelection = new Set<string>();
      for (let i = start; i <= end; i++) {
        if (projects[i]) {
          newSelection.add(projects[i].id);
        }
      }
      
      setSelectedRows(Array.from(newSelection));
    }
  };

  // 자동 스크롤 기능
  useEffect(() => {
    if (!isDragging) {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const mouseY = e.clientY;
      const scrollThreshold = 80; // 가장자리로부터의 거리
      const maxScrollSpeed = 15; // 최대 스크롤 속도

      // 자동 스크롤 인터벌 초기화
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }

      // 상단 근처
      if (mouseY < rect.top + scrollThreshold) {
        const distance = rect.top + scrollThreshold - mouseY;
        const scrollSpeed = Math.min(maxScrollSpeed, (distance / scrollThreshold) * maxScrollSpeed);
        
        autoScrollIntervalRef.current = setInterval(() => {
          if (container.scrollTop > 0) {
            container.scrollTop = Math.max(0, container.scrollTop - scrollSpeed);
          }
        }, 16); // 약 60fps
      }
      // 하단 근처
      else if (mouseY > rect.bottom - scrollThreshold) {
        const distance = mouseY - (rect.bottom - scrollThreshold);
        const scrollSpeed = Math.min(maxScrollSpeed, (distance / scrollThreshold) * maxScrollSpeed);
        
        autoScrollIntervalRef.current = setInterval(() => {
          const maxScroll = container.scrollHeight - container.clientHeight;
          if (container.scrollTop < maxScroll) {
            container.scrollTop = Math.min(maxScroll, container.scrollTop + scrollSpeed);
          }
        }, 16);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
    };
  }, [isDragging]);

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
        onMouseUp={() => {
          setIsDragging(false);
          setDragStartIndex(null);
          if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
            autoScrollIntervalRef.current = null;
          }
        }}
        onMouseLeave={() => {
          setIsDragging(false);
          setDragStartIndex(null);
          if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
            autoScrollIntervalRef.current = null;
          }
        }}
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