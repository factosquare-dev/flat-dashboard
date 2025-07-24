import React, { useState, useEffect } from 'react';
import type { Project } from '../../../types/project';
import { ChevronDown, ChevronRight, Folder, FolderOpen, FileSpreadsheet } from 'lucide-react';
import DraggableProjectTable from './DraggableProjectTable';
import { flattenProjects, toggleProject } from '../../../data/hierarchicalProjects';

interface HierarchicalProjectTableProps {
  projects: Project[];
  selectedRows: string[];
  sortField: keyof Project | null;
  sortDirection: 'asc' | 'desc';
  onSort: (field: keyof Project) => void;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (projectId: string, checked: boolean, index?: number) => void;
  onSelectProject: (project: Project) => void;
  onUpdateProject: (projectId: string, field: keyof Project, value: any) => void;
  onShowOptionsMenu: (projectId: string, position: { top: number; left: number }, event?: React.MouseEvent) => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onDuplicate: (project: Project) => void;
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

  // 평면화된 프로젝트 리스트 생성
  const flatProjects = flattenProjects(projectData);

  // DraggableProjectTable에 전달할 props 수정
  const modifiedProps = {
    ...props,
    projects: flatProjects,
    onSelectRow: (projectId: string, checked: boolean, index?: number) => {
      const project = flatProjects.find(p => p.id === projectId);
      if (project && project.type !== 'task') {
        // 대형/소형 프로젝트 클릭 시 확장/축소
        handleToggleProject(projectId);
      } else {
        // 태스크는 기존 선택 로직 사용
        props.onSelectRow(projectId, checked, index);
      }
    }
  };

  return <DraggableProjectTable {...modifiedProps} />;
};

export default HierarchicalProjectTable;