import React from 'react';
import type { Project } from '@/types/project';
import type { ProjectId } from '@/types/branded';
import EditableCell from '../../EditableCell';
import type { UseEditableCellReturn } from '@/hooks/useEditableCell';
import { EditableCellType } from '@/types/enums';
import ProgressBar from '../../ProgressBar';

interface CellRenderProps {
  project: Project;
  editableCell: UseEditableCellReturn;
  onUpdateField: (projectId: ProjectId, field: keyof Project, value: Project[keyof Project]) => void;
  index?: number;
  isDragging?: boolean;
  onStartDrag?: (index: number) => void;
}

export const renderName = ({ project, editableCell, onUpdateField }: CellRenderProps) => (
  <EditableCell
    project={project}
    field="name"
    type={EditableCellType.TEXT}
    editableCell={editableCell}
    onUpdate={onUpdateField}
  />
);

export const renderProgress = (project: Project) => (
  <td className="px-3 py-2.5">
    <ProgressBar progress={project.progress} />
  </td>
);

export const renderClient = ({ project }: CellRenderProps) => (
  <td className="px-3 py-1.5 text-xs text-gray-900 min-w-[110px]" title={project.client}>
    <div className="overflow-hidden text-ellipsis whitespace-nowrap">
      {project.client}
    </div>
  </td>
);

export const renderDate = (field: 'startDate' | 'endDate', { project, editableCell, onUpdateField }: CellRenderProps) => (
  <EditableCell
    project={project}
    field={field}
    type={EditableCellType.DATE}
    editableCell={editableCell}
    onUpdate={onUpdateField}
  />
);

export const renderCurrency = (field: 'sales' | 'purchase', { project, editableCell, onUpdateField }: CellRenderProps) => (
  <EditableCell
    project={project}
    field={field}
    type={EditableCellType.CURRENCY}
    editableCell={editableCell}
    onUpdate={onUpdateField}
  />
);

export const renderDefault = () => (
  <td className="px-3 py-1.5 text-xs text-gray-400">
    -
  </td>
);