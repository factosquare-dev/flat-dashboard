import React from 'react';
import type { Project } from '../../types/project';
import { MoreVertical } from 'lucide-react';
import { useEditableCell } from '../../hooks/useEditableCell';
import EditableCell from './EditableCell';
import PriorityDropdown from './PriorityDropdown';
import ServiceTypeDropdown from './ServiceTypeDropdown';
import StatusDropdown from './StatusDropdown';
import ProgressBar from './ProgressBar';

interface ProjectTableRowProps {
  project: Project;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onRowClick: (project: Project) => void;
  onUpdateField: (projectId: string, field: keyof Project, value: any) => void;
  onShowOptionsMenu: (projectId: string, position: { top: number; left: number }) => void;
}

const ProjectTableRow: React.FC<ProjectTableRowProps> = ({
  project,
  isSelected,
  onSelect,
  onRowClick,
  onUpdateField,
  onShowOptionsMenu
}) => {
  const editableCell = useEditableCell();

  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button, input, select, a, .js-inline-edit');
    if (!isInteractive) {
      onRowClick(project);
    }
  };

  return (
    <tr 
      className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 transition-all cursor-pointer"
      onClick={handleRowClick}
    >
      <td className="px-3 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="px-3 py-4">
        <PriorityDropdown 
          value={project.priority}
          onChange={(value) => onUpdateField(project.id, 'priority', value)}
        />
      </td>
      <EditableCell
        project={project}
        field="client"
        type="search"
        editableCell={editableCell}
        onUpdate={onUpdateField}
      />
      <td className="px-3 py-4 text-sm text-gray-900">{project.manager}</td>
      <td className="px-3 py-4 text-sm text-gray-900 truncate max-w-[120px]" title={project.productType}>
        {project.productType}
      </td>
      <EditableCell
        project={project}
        field="manufacturer"
        type="search"
        editableCell={editableCell}
        onUpdate={onUpdateField}
      />
      <EditableCell
        project={project}
        field="container"
        type="search"
        editableCell={editableCell}
        onUpdate={onUpdateField}
      />
      <EditableCell
        project={project}
        field="packaging"
        type="search"
        editableCell={editableCell}
        onUpdate={onUpdateField}
      />
      <td className="px-3 py-4">
        <ServiceTypeDropdown
          value={project.serviceType}
          onChange={(value) => onUpdateField(project.id, 'serviceType', value)}
        />
      </td>
      <td className="px-3 py-4 text-xs text-gray-700 truncate max-w-[120px]" title={project.currentStage.join(', ')}>
        {project.currentStage.join(', ') || '-'}
      </td>
      <td className="px-3 py-4">
        <ProgressBar progress={project.progress} />
      </td>
      <td className="px-3 py-4">
        <StatusDropdown
          value={project.status}
          onChange={(value) => onUpdateField(project.id, 'status', value)}
        />
      </td>
      <EditableCell
        project={project}
        field="startDate"
        type="date"
        editableCell={editableCell}
        onUpdate={onUpdateField}
      />
      <EditableCell
        project={project}
        field="endDate"
        type="date"
        editableCell={editableCell}
        onUpdate={onUpdateField}
      />
      <EditableCell
        project={project}
        field="sales"
        type="currency"
        editableCell={editableCell}
        onUpdate={onUpdateField}
      />
      <EditableCell
        project={project}
        field="purchase"
        type="currency"
        editableCell={editableCell}
        onUpdate={onUpdateField}
      />
      <td className="px-3 py-4 text-center">
        <div className="relative inline-block">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              const buttonRect = (e.target as HTMLElement).getBoundingClientRect();
              const dropdownWidth = 160;
              onShowOptionsMenu(project.id, {
                top: buttonRect.bottom + 2,
                left: buttonRect.right - dropdownWidth
              });
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="icon-sm text-gray-600" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ProjectTableRow;