import React from 'react';
import type { Project } from '@/types/project';
import type { ProjectId } from '@/types/branded';
import EditableCell from '../EditableCell';
import SearchableCell from '../SearchableCell';
import PriorityDropdown from '../PriorityDropdown';
import ServiceTypeDropdown from '../ServiceTypeDropdown';
import StatusDropdown from '../StatusDropdown';
import ProductTypeDropdown from '../ProductTypeDropdown';
import ProgressBar from '../ProgressBar';
import type { UseEditableCellReturn } from '@/hooks/useEditableCell';
import { ProjectType as ProjectTypeEnum } from '@/types/enums';
import { isProjectType } from '@/utils/projectTypeUtils';
import { getSubProjectCount } from '@/utils/projectUtils';

interface CellRenderProps {
  project: Project;
  editableCell: UseEditableCellReturn;
  onUpdateField: (projectId: ProjectId, field: keyof Project, value: Project[keyof Project]) => void;
}

export const renderName = ({ project, editableCell, onUpdateField }: CellRenderProps) => (
  <EditableCell
    project={project}
    field="name"
    type="text"
    editableCell={editableCell}
    onUpdate={onUpdateField}
  />
);

export const renderProductType = ({ project, onUpdateField }: CellRenderProps) => {
  // MASTER 프로젝트의 경우 서브 프로젝트 개수 표시
  if (isProjectType(project.type, ProjectTypeEnum.MASTER)) {
    const subProjectCount = getSubProjectCount(project.id);
    return (
      <td className="px-3 py-1.5 text-xs text-gray-900 truncate">
        {subProjectCount > 0 ? `${subProjectCount}종` : '-'}
      </td>
    );
  }
  
  // SUB 프로젝트의 경우 드롭다운으로 선택 가능
  if (isProjectType(project.type, ProjectTypeEnum.SUB)) {
    return (
      <td className="px-3 py-1.5">
        <ProductTypeDropdown
          value={project.productType}
          onChange={(value) => onUpdateField(project.id, 'productType', value)}
        />
      </td>
    );
  }
  
  // 기본적으로 텍스트로 표시
  return (
    <td className="px-3 py-1.5 text-xs text-gray-900 truncate" title={project.productType}>
      {project.productType}
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

export const renderCurrentStage = (project: Project) => (
  <td className="px-3 py-1.5">
    <div className="flex flex-wrap gap-1">
      {project.currentStage.length > 0 ? (
        project.currentStage.map((stage, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200"
          >
            {stage}
          </span>
        ))
      ) : (
        <span className="text-xs text-gray-400">-</span>
      )}
    </div>
  </td>
);

export const renderStatus = ({ project, onUpdateField }: CellRenderProps) => (
  <td className="px-3 py-1.5">
    <StatusDropdown
      value={project.status}
      onChange={(value) => onUpdateField(project.id, 'status', value)}
    />
  </td>
);

export const renderProgress = (project: Project) => (
  <td className="px-3 py-1.5">
    <ProgressBar progress={project.progress} />
  </td>
);

export const renderClient = ({ project }: CellRenderProps) => (
  <td className="px-3 py-1.5 text-xs text-gray-900 truncate" title={project.client}>
    {project.client}
  </td>
);

export const renderDate = (field: 'startDate' | 'endDate', { project, editableCell, onUpdateField }: CellRenderProps) => (
  <EditableCell
    project={project}
    field={field}
    type="date"
    editableCell={editableCell}
    onUpdate={onUpdateField}
  />
);

export const renderFactory = (field: 'manufacturer' | 'container' | 'packaging', { project }: CellRenderProps) => {
  const value = project[field] as string;
  return (
    <td className="px-3 py-1.5 text-xs text-gray-900 truncate" title={value}>
      {value || '-'}
    </td>
  );
};

export const renderCurrency = (field: 'sales' | 'purchase', { project, editableCell, onUpdateField }: CellRenderProps) => (
  <EditableCell
    project={project}
    field={field}
    type="currency"
    editableCell={editableCell}
    onUpdate={onUpdateField}
  />
);

export const renderDepositPaid = ({ project, onUpdateField }: CellRenderProps) => (
  <td className="px-3 py-1.5 text-center">
    <input
      type="checkbox"
      checked={project.depositPaid || false}
      onChange={(e) => {
        e.stopPropagation();
        onUpdateField(project.id, 'depositPaid', e.target.checked);
      }}
      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
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

export const renderDefault = () => (
  <td className="px-3 py-1.5 text-xs text-gray-400">
    -
  </td>
);