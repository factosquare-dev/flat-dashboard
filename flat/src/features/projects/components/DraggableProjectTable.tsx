import React from 'react';
import type { Project } from '../../../types/project';
import ProjectTableRow from './ProjectTableRow/index';
import { useColumnOrder } from '../../../hooks/useColumnOrder';
import type { Column } from '../../../hooks/useColumnOrder';

interface DraggableProjectTableProps {
  projects: Project[];
  selectedRows: string[];
  sortField: keyof Project | null;
  sortDirection: 'asc' | 'desc';
  onSort: (field: keyof Project) => void;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (projectId: string, checked: boolean, index?: number) => void;
  onSelectProject: (project: Project) => void;
  onUpdateProject: (projectId: string, field: keyof Project, value: any) => void;
  onShowOptionsMenu: (projectId: string, position: { top: number; left: number }, event?: React.MouseEvent) => void;
  onMouseEnterRow?: (index: number) => void;
  isDragging?: boolean;
  onStartDrag?: (index: number) => void;
}

const DraggableProjectTable: React.FC<DraggableProjectTableProps> = ({
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

  const renderHeaderCell = (column: Column) => {
    const isDraggable = column.id !== 'checkbox' && column.id !== 'options';
    
    return (
      <th
        key={column.id}
        className={`table-header-cell ${column.sortable ? 'table-header-cell-sortable' : ''} ${
          column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''
        } ${draggedColumn === column.id ? 'opacity-50' : ''} ${column.width || ''}`}
        draggable={isDraggable}
        onDragStart={isDraggable ? () => handleDragStart(column.id) : undefined}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={isDraggable ? (e) => handleDrop(e, column.id) : undefined}
        onClick={column.sortable ? () => onSort(column.id as keyof Project) : undefined}
      >
        <div className={`flex items-center ${
          column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : 'justify-between'
        }`}>
          <span>{column.label}</span>
          {column.sortable && sortField === column.id && (
            <span className="text-blue-600">
              {sortDirection === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </div>
      </th>
    );
  };

  return (
    <table className="w-full min-w-[1800px] table-fixed" role="table">
        <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-100">
          <tr role="row">
            <th className="w-16 px-1 py-1.5 text-left" scope="col">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  onChange={(e) => onSelectAll(e.target.checked)}
                  checked={projects.length > 0 && selectedRows.length === projects.filter(p => p.type === 'task').length}
                />
              </div>
            </th>
            {columns.map(renderHeaderCell)}
            <th className="table-header-cell text-center w-12" scope="col">
              <span className="sr-only">프로젝트 옵션</span>
              <svg className="w-4 h-4 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {projects?.map((project, index) => (
            <React.Fragment key={project.id}>
              <ProjectTableRow
                project={project}
                index={index}
                columns={columns}
                isSelected={selectedRows.includes(project.id)}
                onSelect={(checked) => onSelectRow(project.id, checked, index)}
                onRowClick={onSelectProject}
                onUpdateField={onUpdateProject}
                onShowOptionsMenu={onShowOptionsMenu}
                onMouseEnter={onMouseEnterRow ? () => onMouseEnterRow(index) : undefined}
                isDragging={isDragging}
                onStartDrag={onStartDrag ? () => onStartDrag(index) : undefined}
              />
            </React.Fragment>
          ))}
        </tbody>
      </table>
  );
};

export default DraggableProjectTable;