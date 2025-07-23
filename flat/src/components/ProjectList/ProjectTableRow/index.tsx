import React from 'react';
import type { Project } from '../../../types/project';
import { MoreVertical } from 'lucide-react';
import { useEditableCell } from '../../../hooks/useEditableCell';
import TaskList from '../TaskList';
import type { Column } from '../../../hooks/useColumnOrder';
import { useTaskManagement } from './useTaskManagement';
import SelectionCell from './SelectionCell';
import * as cellRenderers from './cellRenderers';

interface ProjectTableRowProps {
  project: Project;
  columns: Column[];
  index?: number;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onRowClick: (project: Project) => void;
  onUpdateField: (projectId: string, field: keyof Project, value: Project[keyof Project]) => void;
  onShowOptionsMenu: (projectId: string, position: { top: number; left: number }, event?: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  isDragging?: boolean;
  onStartDrag?: (index: number) => void;
}

const ProjectTableRow: React.FC<ProjectTableRowProps> = React.memo(({
  project,
  columns,
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
  const { isExpanded, tasks, handleToggleTasks, handleTaskToggle } = useTaskManagement();

  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button, input, select, a, .js-inline-edit');
    if (!isInteractive) {
      onRowClick(project);
    }
  };

  const renderCell = (columnId: string) => {
    const cellRenderProps = { project, editableCell, onUpdateField };

    switch (columnId) {
      case 'productType':
        return cellRenderers.renderProductType(project);
      
      case 'serviceType':
        return cellRenderers.renderServiceType(cellRenderProps);
      
      case 'currentStage':
        return cellRenderers.renderCurrentStage(project);
      
      case 'status':
        return cellRenderers.renderStatus(cellRenderProps);
      
      case 'progress':
        return cellRenderers.renderProgress(project);
      
      case 'client':
        return cellRenderers.renderClient(cellRenderProps);
      
      case 'startDate':
        return cellRenderers.renderDate('startDate', cellRenderProps);
      
      case 'endDate':
        return cellRenderers.renderDate('endDate', cellRenderProps);
      
      case 'manufacturer':
        return cellRenderers.renderFactory('manufacturer', cellRenderProps);
      
      case 'container':
        return cellRenderers.renderFactory('container', cellRenderProps);
      
      case 'packaging':
        return cellRenderers.renderFactory('packaging', cellRenderProps);
      
      case 'sales':
        return cellRenderers.renderCurrency('sales', cellRenderProps);
      
      case 'purchase':
        return cellRenderers.renderCurrency('purchase', cellRenderProps);
      
      case 'depositPaid':
        return cellRenderers.renderDepositPaid(cellRenderProps);
      
      case 'priority':
        return cellRenderers.renderPriority(cellRenderProps);
      
      default:
        return cellRenderers.renderDefault();
    }
  };

  return (
    <>
      <tr 
        data-id={project.id}
        className="group hover:bg-gray-50/30 transition-all duration-200 cursor-pointer border-b border-gray-50"
        onClick={handleRowClick}
        onMouseEnter={onMouseEnter}
        role="row"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleRowClick(e);
          }
        }}
      >
        <SelectionCell
          project={project}
          isExpanded={isExpanded}
          isSelected={isSelected}
          isDragging={isDragging}
          index={index}
          onSelect={onSelect}
          onStartDrag={onStartDrag}
          handleToggleTasks={handleToggleTasks}
        />
        
        {columns.map((column) => (
          <React.Fragment key={column.id}>
            {renderCell(column.id)}
          </React.Fragment>
        ))}
        
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
                }, e);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors options-menu-button"
              aria-label={`프로젝트 ${project.client} 옵션 메뉴`}
              aria-haspopup="true"
            >
              <MoreVertical className="icon-sm text-gray-600" aria-hidden="true" />
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-white border-b border-gray-200">
          <td colSpan={columns.length + 2} className="p-0">
            <TaskList 
              projectId={project.id}
              tasks={tasks}
              onTaskToggle={handleTaskToggle}
            />
          </td>
        </tr>
      )}
    </>
  );
}, (prevProps, nextProps) => {
  // props 비교 함수로 불필요한 리렌더링 방지
  return (
    prevProps.project.id === nextProps.project.id &&
    prevProps.project === nextProps.project &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isDragging === nextProps.isDragging &&
    prevProps.index === nextProps.index &&
    prevProps.columns.length === nextProps.columns.length &&
    prevProps.columns.every((col, idx) => col.id === nextProps.columns[idx]?.id)
  );
});

ProjectTableRow.displayName = 'ProjectTableRow';

export default ProjectTableRow;