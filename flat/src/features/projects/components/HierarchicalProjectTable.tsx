import React, { useState, useEffect } from 'react';
import type { Project } from '../../../types/project';
import { ChevronDown, ChevronRight, Folder, FolderOpen, FileSpreadsheet } from 'lucide-react';
import DraggableProjectTable from './DraggableProjectTable';
import { flattenProjects, toggleProject } from '../../../data/hierarchicalProjects';
import { ProjectType } from '../../../types/enums';
import { isProjectType } from '../../../utils/projectTypeUtils';

interface HierarchicalProjectTableProps {
  projects: Project[];
  selectedRows: string[];
  sortField: keyof Project | null;
  sortDirection: 'asc' | 'desc';
  hiddenColumns?: Set<string>;
  onSort: (field: keyof Project) => void;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (projectId: string, checked: boolean, index?: number) => void;
  onSelectProject: (project: Project) => void;
  onUpdateProject: (projectId: string, field: keyof Project, value: any) => void;
  onShowOptionsMenu: (projectId: string, position: { top: number; left: number }, event?: React.MouseEvent) => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onDuplicate: (project: Project) => void;
  onDragStart?: (projectId: string) => void;
  onDragEnd?: () => void;
}

const HierarchicalProjectTable: React.FC<HierarchicalProjectTableProps> = (props) => {
  const [projectData, setProjectData] = useState<Project[]>(props.projects);
  
  // Sync local state with props when props change
  useEffect(() => {
    setProjectData(props.projects);
  }, [props.projects]);
  
  const handleToggleProject = (projectId: string) => {
    const toggled = toggleProject(projectData, projectId);
    setProjectData(toggled);
  };

  // 평면화된 프로젝트 리스트 생성 (그룹 지원)
  const flatProjects = React.useMemo(() => {
    const flattened: any[] = [];
    
    const flatten = (items: any[], level: number = 0) => {
      items.forEach(item => {
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
      const project = flatProjects.find(p => p.id === projectId);
      if (project) {
        // Master 프로젝트는 onSelectRow에서 처리하지 않음
        // SelectionCell에서 별도의 버튼으로 처리
        if (!isProjectType(project.type, ProjectType.MASTER)) {
          // SUB와 TASK만 선택 가능
          props.onSelectRow(projectId, checked, index);
        }
      }
    },
    onToggleMaster: handleToggleProject,
    onMouseEnterRow: props.onMouseEnterRow,
    onStartDrag: (index: number) => {
      // Master 프로젝트에서는 드래그 시작 방지
      const project = flatProjects[index];
      if (project && isProjectType(project.type, ProjectType.MASTER)) {
        return;
      }
      if (props.onStartDrag) {
        props.onStartDrag(index);
      }
    }
  };

  return <DraggableProjectTable {...modifiedProps} onDragStart={props.onDragStart} onDragEnd={props.onDragEnd} />;
};

export default HierarchicalProjectTable;