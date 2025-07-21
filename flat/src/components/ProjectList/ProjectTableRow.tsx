import React from 'react';
import type { Project } from '../../types/project';
import { MoreVertical } from 'lucide-react';
import { useEditableCell } from '../../hooks/useEditableCell';
import EditableCell from './EditableCell';
import SearchableCell from '../../features/projects/components/SearchableCell';
import PriorityDropdown from './PriorityDropdown';
import ServiceTypeDropdown from './ServiceTypeDropdown';
import StatusDropdown from './StatusDropdown';
import ProgressBar from './ProgressBar';

interface ProjectTableRowProps {
  project: Project;
  index?: number;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onRowClick: (project: Project) => void;
  onUpdateField: (projectId: string, field: keyof Project, value: any) => void;
  onShowOptionsMenu: (projectId: string, position: { top: number; left: number }) => void;
  onMouseEnter?: () => void;
  isDragging?: boolean;
  onStartDrag?: (index: number) => void;
}

const ProjectTableRow: React.FC<ProjectTableRowProps> = ({
  project,
  index,
  isSelected,
  onSelect,
  onRowClick,
  onUpdateField,
  onShowOptionsMenu,
  onMouseEnter,
  isDragging,
  onStartDrag
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
      data-id={project.id}
      className="group hover:bg-gray-50/30 transition-all duration-200 cursor-pointer border-b border-gray-50"
      onClick={handleRowClick}
      onMouseEnter={onMouseEnter}
    >
      <td className="px-1 py-1.5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(e.target.checked);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              // 드래그 시작
              if (index !== undefined && onStartDrag) {
                onStartDrag(index);
              }
            }}
            onMouseEnter={(e) => {
              if (isDragging && e.buttons === 1) {
                e.stopPropagation();
                // 드래그 중에는 행의 onMouseEnter가 처리하므로 여기서는 아무것도 하지 않음
              }
            }}
            className="w-4 h-4 rounded border border-gray-300 text-blue-600 focus:ring-1 focus:ring-blue-500 cursor-pointer transition-all hover:border-blue-400"
            style={{ userSelect: 'none' }}
          />
        </div>
      </td>
      <td className="px-1.5 py-1.5 text-xs text-gray-900 truncate" title={project.productType}>
        {project.productType}
      </td>
      <td className="px-1.5 py-1.5">
        <ServiceTypeDropdown
          value={project.serviceType}
          onChange={(value) => onUpdateField(project.id, 'serviceType', value)}
        />
      </td>
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
      <td className="px-1.5 py-1.5">
        <StatusDropdown
          value={project.status}
          onChange={(value) => onUpdateField(project.id, 'status', value)}
        />
      </td>
      <td className="px-1.5 py-1.5">
        <ProgressBar progress={project.progress} />
      </td>
      <SearchableCell
        project={project}
        field="client"
        onUpdate={onUpdateField}
      />
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
      <SearchableCell
        project={project}
        field="manufacturer"
        onUpdate={onUpdateField}
      />
      <SearchableCell
        project={project}
        field="container"
        onUpdate={onUpdateField}
      />
      <SearchableCell
        project={project}
        field="packaging"
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
      <td className="px-1.5 py-1.5">
        <PriorityDropdown 
          value={project.priority}
          onChange={(value) => onUpdateField(project.id, 'priority', value)}
        />
      </td>
      <td className="px-1.5 py-1.5 text-center">
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
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors options-menu-button"
          >
            <MoreVertical className="icon-sm text-gray-600" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ProjectTableRow;