import React from 'react';
import type { Project } from '@/types/project';
import type { ProjectId } from '@/types/branded';
import type { UseEditableCellReturn } from '@/hooks/useEditableCell';
import PriorityDropdown from '@/features/projects/components/PriorityDropdown';
import ServiceTypeDropdown from '@/features/projects/components/ServiceTypeDropdown';
import StatusDropdown from '@/features/projects/components/StatusDropdown';
import ProductTypeDropdown from '@/features/projects/components/ProductTypeDropdown';
import { ProjectType, Priority, PriorityLabel } from '@/types/enums';
import { isProjectType } from '@/utils/projectTypeUtils';
import { getSubProjectCount } from '@/utils/projectUtils';

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

interface CellRenderProps {
  project: Project;
  editableCell: UseEditableCellReturn;
  onUpdateField: (projectId: ProjectId, field: keyof Project, value: Project[keyof Project]) => void;
  index?: number;
  isDragging?: boolean;
  onStartDrag?: (index: number) => void;
}

export const renderProductType = ({ project, onUpdateField }: CellRenderProps) => {
  // MASTER 프로젝트의 경우 서브 프로젝트 개수 표시
  if (isProjectType(project.type, ProjectType.MASTER)) {
    const subProjectCount = getSubProjectCount(project.id);
    return (
      <td className="px-3 py-1.5 text-xs text-gray-900 min-w-[120px]">
        <div className="text-left">
          {subProjectCount > 0 ? `${subProjectCount}종` : '-'}
        </div>
      </td>
    );
  }
  
  // SUB 프로젝트의 경우 드롭다운으로 선택 가능
  if (isProjectType(project.type, ProjectType.SUB)) {
    return (
      <td className="px-3 py-1.5 min-w-[120px]">
        <ProductTypeDropdown
          value={project.productType}
          onChange={(value) => onUpdateField(project.id, 'productType', value)}
        />
      </td>
    );
  }
  
  // 기본적으로 텍스트로 표시
  return (
    <td className="px-3 py-1.5 text-xs text-gray-900 min-w-[120px]" title={project.productType}>
      <div className="overflow-hidden text-ellipsis whitespace-nowrap">
        {project.productType}
      </div>
    </td>
  );
};

export const renderServiceType = ({ project, onUpdateField }: CellRenderProps) => {
  return (
    <td className="px-3 py-1.5">
      <ServiceTypeDropdown
        value={project.serviceType}
        onChange={(value) => onUpdateField(project.id, 'serviceType', value)}
      />
    </td>
  );
};

export const renderStatus = ({ project, onUpdateField }: CellRenderProps) => (
  <td className="px-3 py-1.5">
    <StatusDropdown
      value={project.status}
      onChange={(value) => onUpdateField(project.id, 'status', value)}
    />
  </td>
);

export const renderPriority = ({ project, onUpdateField }: CellRenderProps) => {
  const isEditable = isMasterFieldEditable(project, 'priority');
  
  if (!isEditable) {
    // Master 프로젝트는 우선순위를 편집할 수 없음 (집계된 값 또는 기본값 표시)
    const priorityText = PriorityLabel[project.priority] || '보통';
    
    return (
      <td className="px-3 py-1.5 text-xs text-gray-900" title={priorityText}>
        <div className="overflow-hidden text-ellipsis whitespace-nowrap text-gray-500">
          {priorityText}
        </div>
      </td>
    );
  }
  
  return (
    <td className="px-3 py-1.5">
      <PriorityDropdown 
        value={project.priority}
        onChange={(value) => onUpdateField(project.id, 'priority', value)}
      />
    </td>
  );
};

// Component exports for use in cellRenderer
export const ProductTypeCell = (props: CellRenderProps) => {
  const td = renderProductType(props);
  return React.isValidElement(td) ? td.props.children : null;
};

export const ServiceTypeCell = (props: CellRenderProps) => {
  const td = renderServiceType(props);
  return React.isValidElement(td) ? td.props.children : null;
};

export const StatusCell = (props: CellRenderProps) => {
  const td = renderStatus(props);
  return React.isValidElement(td) ? td.props.children : null;
};

export const PriorityCell = (props: CellRenderProps) => {
  const td = renderPriority(props);
  return React.isValidElement(td) ? td.props.children : null;
};