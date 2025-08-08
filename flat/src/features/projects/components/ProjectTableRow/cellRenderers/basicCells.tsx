import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '@/types/project';
import type { ProjectId } from '@/types/branded';
import EditableCell from '@/features/projects/components/EditableCell';
import type { UseEditableCellReturn } from '@/hooks/useEditableCell';
import { EditableCellType, ProjectType } from '@/types/enums';
import { isProjectType } from '@/utils/projectTypeUtils';
import ProgressBar from '@/features/projects/components/ProgressBar';

interface CellRenderProps {
  project: Project;
  editableCell: UseEditableCellReturn;
  onUpdateField: (projectId: ProjectId, field: keyof Project, value: Project[keyof Project]) => void;
  index?: number;
  isDragging?: boolean;
  onStartDrag?: (index: number) => void;
  onToggleTasks?: () => void;
}

// Master 프로젝트에서 편집 가능한 필드 정의
const MASTER_EDITABLE_FIELDS = new Set([
  'name',        // 프로젝트명
  'client',      // 고객명  
  'status',      // 상태
  'startDate',   // 시작일
  'endDate',     // 마감일
  'serviceType'  // 서비스 타입
]);

// Master 프로젝트에서 필드 편집 가능 여부 확인
const isMasterFieldEditable = (project: Project, field: string): boolean => {
  if (!isProjectType(project.type, ProjectType.MASTER)) {
    return true; // Master가 아니면 모든 필드 편집 가능
  }
  return MASTER_EDITABLE_FIELDS.has(field);
};

export const renderName = ({ project, editableCell, onUpdateField }: CellRenderProps) => {
  const isEditable = isMasterFieldEditable(project, 'name');
  
  if (!isEditable) {
    return (
      <td className="px-3 py-1.5 text-xs text-gray-900 min-w-[120px]" title={project.name}>
        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
          {project.name}
        </div>
      </td>
    );
  }
  
  return (
    <EditableCell
      project={project}
      field="name"
      type={EditableCellType.TEXT}
      editableCell={editableCell}
      onUpdate={onUpdateField}
    />
  );
};

export const renderProgress = (project: Project) => (
  <td className="px-3 py-2.5">
    <ProgressBar progress={project.progress} />
  </td>
);

export const renderClient = ({ project }: CellRenderProps) => {
  const navigate = useNavigate();
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to TableView with project ID
    navigate(`/projects?view=table&projectId=${project.id}`);
  };

  return (
    <td 
      className="px-3 py-1.5 text-xs text-gray-900 min-w-[110px] cursor-pointer" 
      title={project.client}
      onClick={handleClick}
    >
      <div className="overflow-hidden text-ellipsis whitespace-nowrap">
        {project.client}
      </div>
    </td>
  );
};

export const renderDate = (field: 'startDate' | 'endDate', { project, editableCell, onUpdateField }: CellRenderProps) => {
  const isEditable = isMasterFieldEditable(project, field);
  
  if (!isEditable) {
    const dateValue = project[field];
    const displayDate = dateValue ? new Date(dateValue).toLocaleDateString('ko-KR') : '';
    
    return (
      <td className="px-3 py-1.5 text-xs text-gray-900 min-w-[90px]" title={displayDate}>
        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
          {displayDate}
        </div>
      </td>
    );
  }
  
  return (
    <EditableCell
      project={project}
      field={field}
      type={EditableCellType.DATE}
      editableCell={editableCell}
      onUpdate={onUpdateField}
    />
  );
};

export const renderCurrency = (field: 'sales' | 'purchase', { project, editableCell, onUpdateField }: CellRenderProps) => {
  // Master 프로젝트의 매출/매입은 Sub에서 집계된 값이므로 편집 불가
  const isEditable = !isProjectType(project.type, ProjectType.MASTER);
  
  if (!isEditable) {
    const value = project[field];
    const displayValue = typeof value === 'number' 
      ? value.toLocaleString('ko-KR') + '원'
      : value || '0원';
    
    return (
      <td className="px-3 py-1.5 text-xs text-gray-900 min-w-[90px] text-right" title={displayValue}>
        <div className="overflow-hidden text-ellipsis whitespace-nowrap text-blue-600 font-medium">
          {displayValue}
        </div>
      </td>
    );
  }
  
  return (
    <EditableCell
      project={project}
      field={field}
      type={EditableCellType.CURRENCY}
      editableCell={editableCell}
      onUpdate={onUpdateField}
    />
  );
};

export const renderDefault = () => (
  <td className="px-3 py-1.5 text-xs text-gray-400">
    
  </td>
);

// Component exports for use in cellRenderer
export const NameCell = (props: CellRenderProps) => {
  // renderName now always returns a td element
  return renderName(props);
};

export const ClientCell = (props: CellRenderProps) => {
  return renderClient(props);
};

export const ProgressCell = (props: CellRenderProps) => {
  return renderProgress(props.project);
};

export const StartDateCell = (props: CellRenderProps) => {
  return renderDate('startDate', props);
};

export const EndDateCell = (props: CellRenderProps) => {
  return renderDate('endDate', props);
};

export const SalesCell = (props: CellRenderProps) => {
  return renderCurrency('sales', props);
};

export const PurchaseCell = (props: CellRenderProps) => {
  return renderCurrency('purchase', props);
};