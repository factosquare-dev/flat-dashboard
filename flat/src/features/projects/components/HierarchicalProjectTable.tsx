import React, { useState, useEffect } from 'react';
import type { Project } from '@/types/project';
import { ChevronDown, ChevronRight, Folder, FolderOpen, FileSpreadsheet } from 'lucide-react';
import DraggableProjectTable from './DraggableProjectTable';
import { flattenProjects, toggleProject } from '@/data/hierarchicalProjects';
import { ProjectType } from '@/types/enums';
import { isProjectType } from '@/utils/projectTypeUtils';

interface HierarchicalProjectTableProps {
  projects: Project[];
  selectedRows: string[];
  sortField: keyof Project | null;
  sortDirection: 'asc' | 'desc';
  hiddenColumns?: Set<string>;
  showOptionsMenu?: string | null;
  dropdownPosition?: { top: number; left: number } | null;
  isDragging?: boolean;
  onSort: (field: keyof Project) => void;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (projectId: string, checked: boolean, index?: number) => void;
  onSelectProject: (project: Project) => void;
  onUpdateProject?: <K extends keyof Project>(projectId: string, field: K, value: Project[K]) => void;
  onShowOptionsMenu: (projectId: string, position: { top: number; left: number }, event?: React.MouseEvent) => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onDuplicate: (project: Project) => void;
  onMouseEnterRow?: (index: number) => void;
  onStartDrag?: (index: number) => void;
  onEndDrag?: () => void;
  onDragStart?: (projectId: string) => void;
}

const HierarchicalProjectTable: React.FC<HierarchicalProjectTableProps> = (props) => {
  const [expandedState, setExpandedState] = useState<Record<string, boolean>>({});
  
  // Merge props.projects with local expanded state
  const projectData = React.useMemo(() => {
    const mergeExpandedState = (projects: Project[]): Project[] => {
      if (!projects || !Array.isArray(projects)) {
        return [];
      }
      return projects.map(project => ({
        ...project,
        isExpanded: expandedState[project.id] !== undefined 
          ? expandedState[project.id] 
          : project.isExpanded,
        children: project.children ? mergeExpandedState(project.children) : undefined
      }));
    };
    
    return mergeExpandedState(props.projects);
  }, [props.projects, expandedState]);
  
  const handleToggleProject = (projectId: string) => {
    // Find current expanded state from projectData
    const findProject = (projects: Project[]): boolean | undefined => {
      for (const project of projects) {
        if (project.id === projectId) {
          return project.isExpanded;
        }
        if (project.children) {
          const found = findProject(project.children);
          if (found !== undefined) return found;
        }
      }
      return undefined;
    };
    
    const currentExpanded = findProject(projectData);
    setExpandedState(prev => ({
      ...prev,
      [projectId]: currentExpanded !== undefined ? !currentExpanded : false
    }));
  };

  // 평면화된 프로젝트 리스트 생성 (그룹 지원)
  const flatProjects = React.useMemo(() => {
    const flattened: any[] = [];
    const seenIds = new Set<string>();
    
    const flatten = (items: any[], level: number = 0) => {
      items.forEach(item => {
        if (seenIds.has(item.id)) {
          return; // Skip duplicate IDs
        }
        seenIds.add(item.id);
        flattened.push({ ...item, level });
        if (item.children && item.isExpanded) {
          flatten(item.children, level + 1);
        }
      });
    };
    
    flatten(projectData);
    return flattened;
  }, [projectData]);

  // DraggableProjectTable에 전달할 props 수정
  const modifiedProps = {
    ...props,
    projects: flatProjects,
    onSelectRow: (projectId: string, checked: boolean, index?: number) => {
      // Now all project types including Master can be selected
      props.onSelectRow(projectId, checked, index);
    },
    onToggleMaster: handleToggleProject,
    onMouseEnterRow: props.onMouseEnterRow,
    isDragging: props.isDragging,
    onStartDrag: (index: number) => {
      // Master 프로젝트에서는 드래그 시작 방지
      const project = flatProjects[index];
      if (project && isProjectType(project.type, ProjectType.MASTER)) {
        return;
      }
      if (props.onStartDrag) {
        props.onStartDrag(index);
      }
    },
    onDragEnd: props.onEndDrag,
    onDragStart: props.onDragStart
  };

  return <DraggableProjectTable {...modifiedProps} />;
};

export default HierarchicalProjectTable;