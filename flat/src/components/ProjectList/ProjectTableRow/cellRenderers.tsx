import React from 'react';
import type { Project } from '../../../types/project';
import EditableCell from '../EditableCell';
import SearchableCell from '../../../features/projects/components/SearchableCell';
import PriorityDropdown from '../PriorityDropdown';
import ServiceTypeDropdown from '../ServiceTypeDropdown';
import StatusDropdown from '../StatusDropdown';
import ProgressBar from '../ProgressBar';
import type { UseEditableCellReturn } from '../../../hooks/useEditableCell';

interface CellRenderProps {
  project: Project;
  editableCell: UseEditableCellReturn;
  onUpdateField: (projectId: string, field: keyof Project, value: Project[keyof Project]) => void;
}

export const renderProductType = (project: Project) => (
  <td className="px-1.5 py-1.5 text-xs text-gray-900 truncate" title={project.productType}>
    {project.productType}
  </td>
);

export const renderServiceType = ({ project, onUpdateField }: CellRenderProps) => (
  <td className="px-1.5 py-1.5">
    <ServiceTypeDropdown
      value={project.serviceType}
      onChange={(value) => onUpdateField(project.id, 'serviceType', value)}
    />
  </td>
);

export const renderCurrentStage = (project: Project) => (
  <td className="px-1.5 py-1.5">
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
  <td className="px-1.5 py-1.5">
    <StatusDropdown
      value={project.status}
      onChange={(value) => onUpdateField(project.id, 'status', value)}
    />
  </td>
);

export const renderProgress = (project: Project) => (
  <td className="px-1.5 py-1.5">
    <ProgressBar progress={project.progress} />
  </td>
);

export const renderClient = ({ project, onUpdateField }: CellRenderProps) => (
  <SearchableCell
    project={project}
    field="client"
    onUpdate={onUpdateField}
  />
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

export const renderFactory = (field: 'manufacturer' | 'container' | 'packaging', { project, onUpdateField }: CellRenderProps) => (
  <SearchableCell
    project={project}
    field={field}
    onUpdate={onUpdateField}
  />
);

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
  <td className="px-1.5 py-1.5 text-center">
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
  <td className="px-1.5 py-1.5">
    <PriorityDropdown 
      value={project.priority}
      onChange={(value) => onUpdateField(project.id, 'priority', value)}
    />
  </td>
);

export const renderDefault = () => (
  <td className="px-1.5 py-1.5 text-xs text-gray-400">
    -
  </td>
);