import React from 'react';
import type { Project } from '@/types/project';
import type { ProjectId } from '@/types/branded';
import type { UseEditableCellReturn } from '@/hooks/useEditableCell';
import PriorityDropdown from '../../PriorityDropdown';
import ServiceTypeDropdown from '../../ServiceTypeDropdown';
import StatusDropdown from '../../StatusDropdown';
import ProductTypeDropdown from '../../ProductTypeDropdown';
import { ProjectType } from '@/types/enums';
import { isProjectType } from '@/utils/projectTypeUtils';
import { getSubProjectCount } from '@/utils/projectUtils';

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

export const renderPriority = ({ project, onUpdateField }: CellRenderProps) => (
  <td className="px-3 py-1.5">
    <PriorityDropdown 
      value={project.priority}
      onChange={(value) => onUpdateField(project.id, 'priority', value)}
    />
  </td>
);