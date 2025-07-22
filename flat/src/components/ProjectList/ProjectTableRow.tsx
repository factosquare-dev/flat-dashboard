import React, { useState } from 'react';
import type { Project } from '../../types/project';
import { 
  MoreVertical, 
  ChevronDown, 
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  FileText,
  Package,
  Truck,
  Settings
} from 'lucide-react';
import { useEditableCell } from '../../hooks/useEditableCell';
import EditableCell from './EditableCell';
import SearchableCell from '../../features/projects/components/SearchableCell';
import PriorityDropdown from './PriorityDropdown';
import ServiceTypeDropdown from './ServiceTypeDropdown';
import StatusDropdown from './StatusDropdown';
import ProgressBar from './ProgressBar';
import TaskList from './TaskList';
import type { Column } from '../../hooks/useColumnOrder';

interface Task {
  id: string;
  name: string;
  completed: boolean;
}

interface ProjectTableRowProps {
  project: Project;
  columns: Column[];
  index?: number;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onRowClick: (project: Project) => void;
  onUpdateField: (projectId: string, field: keyof Project, value: any) => void;
  onShowOptionsMenu: (projectId: string, position: { top: number; left: number }, event?: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  isDragging?: boolean;
  onStartDrag?: (index: number) => void;
}

const ProjectTableRow: React.FC<ProjectTableRowProps> = ({
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
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Default tasks based on the image
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', name: '원료 준비', completed: true },
    { id: '2', name: '혼합 및 제조', completed: true },
    { id: '3', name: '금형 제작', completed: true },
    { id: '4', name: '안정성 테스트', completed: false },
    { id: '5', name: '시홍 성형', completed: false },
    { id: '6', name: '디자인 작업', completed: false },
    { id: '7', name: '포장 작업', completed: false }
  ]);

  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button, input, select, a, .js-inline-edit');
    if (!isInteractive) {
      onRowClick(project);
    }
  };

  const handleToggleTasks = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleTaskToggle = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getTaskIcon = (iconType?: string) => {
    switch (iconType) {
      case 'document':
        return <FileText className="w-4 h-4" />;
      case 'package':
        return <Package className="w-4 h-4" />;
      case 'truck':
        return <Truck className="w-4 h-4" />;
      case 'settings':
        return <Settings className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusIcon = (status?: string, completed?: boolean) => {
    if (completed) return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    
    switch (status) {
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'delayed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const renderCell = (columnId: string) => {
    switch (columnId) {
      case 'productType':
        return (
          <td className="px-1.5 py-1.5 text-xs text-gray-900 truncate" title={project.productType}>
            {project.productType}
          </td>
        );
      
      case 'serviceType':
        return (
          <td className="px-1.5 py-1.5">
            <ServiceTypeDropdown
              value={project.serviceType}
              onChange={(value) => onUpdateField(project.id, 'serviceType', value)}
            />
          </td>
        );
      
      case 'currentStage':
        return (
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
      
      case 'status':
        return (
          <td className="px-1.5 py-1.5">
            <StatusDropdown
              value={project.status}
              onChange={(value) => onUpdateField(project.id, 'status', value)}
            />
          </td>
        );
      
      case 'progress':
        return (
          <td className="px-1.5 py-1.5">
            <ProgressBar progress={project.progress} />
          </td>
        );
      
      case 'client':
        return (
          <SearchableCell
            project={project}
            field="client"
            onUpdate={onUpdateField}
          />
        );
      
      case 'startDate':
        return (
          <EditableCell
            project={project}
            field="startDate"
            type="date"
            editableCell={editableCell}
            onUpdate={onUpdateField}
          />
        );
      
      case 'endDate':
        return (
          <EditableCell
            project={project}
            field="endDate"
            type="date"
            editableCell={editableCell}
            onUpdate={onUpdateField}
          />
        );
      
      case 'manufacturer':
        return (
          <SearchableCell
            project={project}
            field="manufacturer"
            onUpdate={onUpdateField}
          />
        );
      
      case 'container':
        return (
          <SearchableCell
            project={project}
            field="container"
            onUpdate={onUpdateField}
          />
        );
      
      case 'packaging':
        return (
          <SearchableCell
            project={project}
            field="packaging"
            onUpdate={onUpdateField}
          />
        );
      
      case 'sales':
        return (
          <EditableCell
            project={project}
            field="sales"
            type="currency"
            editableCell={editableCell}
            onUpdate={onUpdateField}
          />
        );
      
      case 'purchase':
        return (
          <EditableCell
            project={project}
            field="purchase"
            type="currency"
            editableCell={editableCell}
            onUpdate={onUpdateField}
          />
        );
      
      case 'depositPaid':
        return (
          <td className="px-1.5 py-1.5 text-center">
            <input
              type="checkbox"
              checked={project.depositPaid || false}
              onChange={(e) => {
                e.stopPropagation();
                onUpdateField(project.id, 'depositPaid', e.target.checked);
              }}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
          </td>
        );
      
      case 'priority':
        return (
          <td className="px-1.5 py-1.5">
            <PriorityDropdown 
              value={project.priority}
              onChange={(value) => onUpdateField(project.id, 'priority', value)}
            />
          </td>
        );
      
      default:
        return (
          <td className="px-1.5 py-1.5 text-xs text-gray-400">
            -
          </td>
        );
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
        <td className="px-1 py-1.5" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={handleToggleTasks}
              className="p-0.5 hover:bg-gray-200 rounded transition-colors"
              title={isExpanded ? "태스크 숨기기" : "태스크 표시"}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? "태스크 숨기기" : "태스크 표시"}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </button>
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
              aria-label={`프로젝트 ${project.client} 선택`}
            />
          </div>
        </td>
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
};

export default ProjectTableRow;
