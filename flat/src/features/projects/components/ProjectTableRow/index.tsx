import React from 'react';
import type { Project } from '@/types/project';
import type { ProjectId } from '@/types/branded';
import { MoreVertical } from 'lucide-react';
import { useEditableCell } from '@/hooks/useEditableCell';
import TaskList from '../TaskList';
import type { Column } from '@/hooks/useColumnOrder';
import { useTaskManagement } from './useTaskManagement';
import SelectionCell from './SelectionCell';
import * as cellRenderers from './cellRenderers';
import { ProjectType, ProjectFactoryField } from '@/types/enums';
import { isProjectType } from '@/utils/projectTypeUtils';

interface ProjectTableRowProps {
  project: Project;
  columns: Column[];
  index?: number;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onRowClick: (project: Project) => void;
  onUpdateField: (projectId: ProjectId, field: keyof Project, value: Project[keyof Project]) => void;
  onShowOptionsMenu: (projectId: ProjectId, position: { top: number; left: number }, event?: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  isDragging?: boolean;
  onStartDrag?: (index: number) => void;
  onDragStart?: (e: React.DragEvent, projectId: ProjectId) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, project: Project) => void;
  onToggleMaster?: (projectId: ProjectId) => void;
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
  onStartDrag,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onToggleMaster
}) => {
  const editableCell = useEditableCell();
  const { isExpanded, tasks, handleToggleTasks, handleTaskToggle } = useTaskManagement({ project });
  const [isDragOver, setIsDragOver] = React.useState(false);
  
  const handleMasterToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleMaster) {
      onToggleMaster(project.id);
    }
  };

  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button, input, select, a, .js-inline-edit');
    if (!isInteractive) {
      onRowClick(project);
    }
  };

  const renderCell = (columnId: string) => {
    const cellRenderProps = { 
      project, 
      editableCell, 
      onUpdateField,
      index,
      isDragging,
      onStartDrag 
    };

    switch (columnId) {
      case 'name':
        return cellRenderers.renderName(cellRenderProps);
      
      case 'productType':
        return cellRenderers.renderProductType(cellRenderProps);
      
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
        return (
          <cellRenderers.FactoryCell 
            field={ProjectFactoryField.MANUFACTURER}
            project={project}
            editableCell={editableCell}
            onUpdateField={onUpdateField}
          />
        );
      
      case 'container':
        return (
          <cellRenderers.FactoryCell 
            field={ProjectFactoryField.CONTAINER}
            project={project}
            editableCell={editableCell}
            onUpdateField={onUpdateField}
          />
        );
      
      case 'packaging':
        return (
          <cellRenderers.FactoryCell 
            field={ProjectFactoryField.PACKAGING}
            project={project}
            editableCell={editableCell}
            onUpdateField={onUpdateField}
          />
        );
      
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
        data-project-type={project.type}
        className={`group hover:bg-gray-50/30 transition-all duration-200 border-b border-gray-50 ${
          isProjectType(project.type, ProjectType.MASTER) && isDragOver ? 'bg-blue-100' : ''
        } ${
          isProjectType(project.type, ProjectType.SUB) ? 'cursor-move' : 'cursor-pointer'
        }`}
        onClick={handleRowClick}
        onMouseEnter={(e) => {
          // Master 프로젝트에서는 모든 마우스 이벤트 차단
          if (isProjectType(project.type, ProjectType.MASTER)) {
            e.stopPropagation();
            return;
          }
          if (onMouseEnter) onMouseEnter();
        }}
        onMouseDown={(e) => {
          // Master 프로젝트에서는 드래그 시작 방지
          if (isProjectType(project.type, ProjectType.MASTER)) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onMouseUp={(e) => {
          if (isProjectType(project.type, ProjectType.MASTER)) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onMouseMove={(e) => {
          if (isProjectType(project.type, ProjectType.MASTER)) {
            e.stopPropagation();
          }
        }}
        onMouseLeave={(e) => {
          if (isProjectType(project.type, ProjectType.MASTER)) {
            e.stopPropagation();
          }
        }}
        role="row"
        tabIndex={0}
        draggable={isProjectType(project.type, ProjectType.SUB)}
        onDragStart={onDragStart && isProjectType(project.type, ProjectType.SUB) ? (e) => {
          e.dataTransfer.effectAllowed = 'move';
          onDragStart(e, project.id);
        } : undefined}
        onDragEnd={onDragEnd}
        onDragOver={isProjectType(project.type, ProjectType.MASTER) ? (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          setIsDragOver(true);
          if (onDragOver) onDragOver(e);
        } : undefined}
        onDragLeave={isProjectType(project.type, ProjectType.MASTER) ? () => setIsDragOver(false) : undefined}
        onDrop={onDrop ? (e) => {
          e.preventDefault();
          setIsDragOver(false);
          onDrop(e, project);
        } : undefined}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleRowClick(e);
          }
        }}
      >
        {columns.length > 0 && (
          <SelectionCell
            project={project}
            isExpanded={isExpanded}
            isSelected={isSelected}
            isDragging={isDragging}
            index={index}
            onSelect={onSelect}
            onStartDrag={onStartDrag}
            handleToggleTasks={handleToggleTasks}
            handleMasterToggle={handleMasterToggle}
          />
        )}
        
        {columns.map((column) => {
          const cellRenderProps = { project, editableCell, onUpdateField, index, isDragging };
          
          switch (column.id) {
            case 'name':
              return <React.Fragment key={column.id}>{cellRenderers.renderName(cellRenderProps)}</React.Fragment>;
            case 'productType':
              return <React.Fragment key={column.id}>{cellRenderers.renderProductType(cellRenderProps)}</React.Fragment>;
            case 'serviceType':
              return <React.Fragment key={column.id}>{cellRenderers.renderServiceType(cellRenderProps)}</React.Fragment>;
            case 'currentStage':
              return <React.Fragment key={column.id}>{cellRenderers.renderCurrentStage(project)}</React.Fragment>;
            case 'status':
              return <React.Fragment key={column.id}>{cellRenderers.renderStatus(cellRenderProps)}</React.Fragment>;
            case 'progress':
              return <React.Fragment key={column.id}>{cellRenderers.renderProgress(project)}</React.Fragment>;
            case 'client':
              return <React.Fragment key={column.id}>{cellRenderers.renderClient(cellRenderProps)}</React.Fragment>;
            case 'startDate':
              return <React.Fragment key={column.id}>{cellRenderers.renderDate('startDate', cellRenderProps)}</React.Fragment>;
            case 'endDate':
              return <React.Fragment key={column.id}>{cellRenderers.renderDate('endDate', cellRenderProps)}</React.Fragment>;
            case 'manufacturer':
              return (
                <cellRenderers.FactoryCell 
                  key={column.id}
                  field={ProjectFactoryField.MANUFACTURER}
                  project={project}
                  editableCell={editableCell}
                  onUpdateField={onUpdateField}
                />
              );
            case 'container':
              return (
                <cellRenderers.FactoryCell 
                  key={column.id}
                  field={ProjectFactoryField.CONTAINER}
                  project={project}
                  editableCell={editableCell}
                  onUpdateField={onUpdateField}
                />
              );
            case 'packaging':
              return (
                <cellRenderers.FactoryCell 
                  key={column.id}
                  field={ProjectFactoryField.PACKAGING}
                  project={project}
                  editableCell={editableCell}
                  onUpdateField={onUpdateField}
                />
              );
            case 'sales':
              return <React.Fragment key={column.id}>{cellRenderers.renderCurrency('sales', cellRenderProps)}</React.Fragment>;
            case 'purchase':
              return <React.Fragment key={column.id}>{cellRenderers.renderCurrency('purchase', cellRenderProps)}</React.Fragment>;
            case 'depositPaid':
              return <React.Fragment key={column.id}>{cellRenderers.renderDepositPaid(cellRenderProps)}</React.Fragment>;
            case 'priority':
              return <React.Fragment key={column.id}>{cellRenderers.renderPriority(cellRenderProps)}</React.Fragment>;
            default:
              return <React.Fragment key={column.id}>{cellRenderers.renderDefault()}</React.Fragment>;
          }
        })}
        
        {columns.length > 0 && (
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
        )}
      </tr>
      {isExpanded && (
        <tr className="bg-white border-b border-gray-200">
          <td colSpan={columns.length + (columns.length > 0 ? 2 : 0)} className="p-0">
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