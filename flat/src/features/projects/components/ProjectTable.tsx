import React from 'react';
import type { Project } from '../../types/project';
import type { ProjectId } from '../../types/branded';
import { MoreVertical, GripVertical } from 'lucide-react';
import ProjectTableRow from './ProjectTableRow/index';
import { useColumnOrder } from '../../hooks/useColumnOrder';
import type { Column } from '../../hooks/useColumnOrder';

interface ProjectTableProps {
  projects: Project[];
  selectedRows: ProjectId[];
  sortField: keyof Project | null;
  sortDirection: 'asc' | 'desc';
  onSort: (field: keyof Project) => void;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (projectId: ProjectId, checked: boolean, index?: number) => void;
  onSelectProject: (project: Project) => void;
  onUpdateProject: <K extends keyof Project>(projectId: ProjectId, field: K, value: Project[K]) => void;
  onShowOptionsMenu: (projectId: ProjectId, position: { top: number; left: number }) => void;
  onMouseEnterRow?: (index: number) => void;
  isDragging?: boolean;
  onStartDrag?: (index: number) => void;
}

const ProjectTable: React.FC<ProjectTableProps> = React.memo(({
  projects,
  selectedRows,
  sortField,
  sortDirection,
  onSort,
  onSelectAll,
  onSelectRow,
  onSelectProject,
  onUpdateProject,
  onShowOptionsMenu,
  onMouseEnterRow,
  isDragging,
  onStartDrag
}) => {
  const {
    columns,
    draggedColumn,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    resetColumnOrder
  } = useColumnOrder();
  return (
    <div className="relative">
      <div className="absolute -top-10 right-0 z-10">
        <button
          onClick={resetColumnOrder}
          className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          title="컬럼 순서 초기화"
        >
          열 순서 초기화
        </button>
      </div>
      <table className="w-full min-w-[1950px] table-fixed">
      {columns.length > 0 && (
        <thead className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <tr>
              <th className="w-8 px-1 py-1.5 text-left">
                <div className="flex items-center justify-center">
                  {/* 시각적으로 숨김 - 선택/확장 컨트롤 영역 */}
                  <span className="sr-only">선택/확장</span>
                </div>
              </th>
              {columns.map((column) => {
                const isDragging = draggedColumn === column.id;
                const baseClasses = `table-header-cell ${
                  column.align === 'center' ? 'text-center' : 
                  column.align === 'right' ? 'text-right' : ''
                } ${
                  column.sortable ? 'table-header-cell-sortable' : ''
                } relative select-none`;
                
                return (
                  <th
                    key={column.id}
                    className={`${baseClasses} ${
                      isDragging ? 'opacity-50' : ''
                    } transition-opacity`}
                    draggable
                    onDragStart={() => handleDragStart(column.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.id)}
                    onClick={() => column.sortable && onSort(column.id as keyof Project)}
                  >
                    <div className={`flex items-center ${
                      column.align === 'center' ? 'justify-center' : 
                      column.align === 'right' ? 'justify-end' : 'justify-between'
                    } cursor-move group`}>
                      <div className="flex items-center gap-1">
                        <GripVertical className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span>{column.label}</span>
                      </div>
                      {column.sortable && sortField === column.id && (
                        <span className="text-blue-600 ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
              <th className="table-header-cell text-center w-12">
                {/* 시각적으로 숨김 - 옵션 메뉴용 */}
                <span className="sr-only">옵션</span>
              </th>
            </tr>
          </thead>
      )}
          <tbody className="divide-y divide-gray-100">
            {projects?.map((project, index) => (
              <ProjectTableRow
                key={project.id}
                project={project}
                columns={columns}
                index={index}
                isSelected={selectedRows?.includes(project.id) || false}
                onSelect={(checked) => onSelectRow(project.id, checked, index)}
                onRowClick={onSelectProject}
                onUpdateField={onUpdateProject}
                onShowOptionsMenu={onShowOptionsMenu}
                onMouseEnter={() => onMouseEnterRow?.(index)}
                isDragging={isDragging}
                onStartDrag={onStartDrag}
              />
            ))}
          </tbody>
        </table>
    </div>
  );
});

ProjectTable.displayName = 'ProjectTable';

export default ProjectTable;