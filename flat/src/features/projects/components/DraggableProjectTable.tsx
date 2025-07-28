import React, { useState, useRef } from 'react';
import type { Project } from '../../../types/project';
import type { ProjectId } from '../../../types/branded';
import ProjectTableRow from './ProjectTableRow/index';
import { useColumnOrder } from '../../../hooks/useColumnOrder';
import type { Column } from '../../../hooks/useColumnOrder';
import { useColumnResize } from '../../../hooks/useColumnResize';
import { ProjectTypeEnum } from '../../../types/enums';
import { isProjectType } from '../../../utils/projectTypeUtils';
import { useProjectHierarchy } from '../../../hooks/useProjectHierarchy';
import '../../../styles/tableResize.css';

interface DraggableProjectTableProps {
  projects: Project[];
  selectedRows: string[];
  sortField: keyof Project | null;
  sortDirection: 'asc' | 'desc';
  hiddenColumns?: Set<string>;
  onSort: (field: keyof Project) => void;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (projectId: string, checked: boolean, index?: number) => void;
  onSelectProject: (project: Project) => void;
  onUpdateProject: (projectId: ProjectId, field: keyof Project, value: any) => void;
  onShowOptionsMenu: (projectId: ProjectId, position: { top: number; left: number }, event?: React.MouseEvent) => void;
  onMouseEnterRow?: (index: number) => void;
  isDragging?: boolean;
  onStartDrag?: (index: number) => void;
  onDragStart?: (projectId: string) => void;
  onDragEnd?: () => void;
}

const DraggableProjectTable: React.FC<DraggableProjectTableProps> = ({
  projects,
  selectedRows,
  sortField,
  sortDirection,
  hiddenColumns = new Set(),
  onSort,
  onSelectAll,
  onSelectRow,
  onSelectProject,
  onUpdateProject,
  onShowOptionsMenu,
  onMouseEnterRow,
  isDragging,
  onStartDrag,
  onDragStart,
  onDragEnd
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

  const {
    columnWidths,
    startResize,
    getColumnWidth,
    resetColumnWidths,
    isResizing
  } = useColumnResize();
  
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const { moveToMaster, canBeMoved, canAcceptChildren } = useProjectHierarchy();
  const tableRef = useRef<HTMLTableElement>(null);

  // Filter out hidden columns
  const visibleColumns = columns.filter(col => !hiddenColumns.has(col.id));

  const handleProjectDragStart = (e: React.DragEvent, projectId: string) => {
    setDraggedProjectId(projectId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('projectId', projectId);
    if (onDragStart) {
      onDragStart(projectId);
    }
  };

  const handleProjectDragEnd = (e: React.DragEvent) => {
    // 드래그 종료 시 정리
    setDraggedProjectId(null);
    if (onDragEnd) {
      onDragEnd();
    }
  };

  const handleProjectDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleProjectDrop = (e: React.DragEvent, targetProject: Project) => {
    e.preventDefault();
    e.stopPropagation(); // 이벤트 버블링 중지
    if (!draggedProjectId || draggedProjectId === targetProject.id) return;
    
    // 드롭 대상이 MASTER 프로젝트인 경우
    if (isProjectType(targetProject.type, ProjectTypeEnum.MASTER)) {
      moveToMaster(draggedProjectId, targetProject.id);
    }
    
    setDraggedProjectId(null);
  };

  const renderHeaderCell = (column: Column) => {
    const isDraggable = column.id !== 'checkbox' && column.id !== 'options' && !isResizing;
    const isResizable = column.id !== 'checkbox' && column.id !== 'options';
    const width = getColumnWidth(column.id, column.width);
    
    return (
      <th
        key={column.id}
        className={`table-header-cell ${column.sortable ? 'table-header-cell-sortable' : ''} ${
          column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''
        } ${draggedColumn === column.id ? 'opacity-50' : ''} relative`}
        style={{ 
          width,
          minWidth: '50px'
        }}
        draggable={isDraggable}
        onDragStart={isDraggable ? () => handleDragStart(column.id) : undefined}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={isDraggable ? (e) => handleDrop(e, column.id) : undefined}
        onClick={column.sortable && !isResizing ? () => onSort(column.id as keyof Project) : undefined}
      >
        <div className={`flex items-center ${
          column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : 'justify-between'
        } overflow-hidden`}>
          <span className="truncate">{column.label}</span>
          {column.sortable && sortField === column.id && (
            <span className="text-blue-600 ml-1 flex-shrink-0">
              {sortDirection === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </div>
        {isResizable && (
          <div
            className="resize-handle"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const th = e.currentTarget.parentElement;
              if (th) {
                // Add resizing class to body to prevent text selection
                document.body.classList.add('resizing');
                startResize(column.id, e.clientX, th.offsetWidth);
              }
            }}
          />
        )}
      </th>
    );
  };


  return (
    <div style={{ width: 'max-content', minWidth: '100%' }}>
      <table ref={tableRef} role="table" style={{ width: 'max-content', minWidth: '1800px' }}>
        <thead className="sticky top-0 z-20 bg-gray-50 border-b border-gray-100">
          <tr role="row">
            <th className="w-16 px-1 py-1.5 text-left" scope="col">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  onChange={(e) => onSelectAll(e.target.checked)}
                  checked={projects.length > 0 && selectedRows.length === projects.filter(p => isProjectType(p.type, ProjectTypeEnum.TASK)).length}
                />
              </div>
            </th>
            {visibleColumns.map(renderHeaderCell)}
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
                columns={visibleColumns}
                isSelected={selectedRows.includes(project.id)}
                onSelect={(checked) => onSelectRow(project.id, checked, index)}
                onRowClick={onSelectProject}
                onUpdateField={onUpdateProject}
                onShowOptionsMenu={onShowOptionsMenu}
                onMouseEnter={onMouseEnterRow ? () => onMouseEnterRow(index) : undefined}
                isDragging={isDragging}
                onStartDrag={onStartDrag ? () => onStartDrag(index) : undefined}
                onDragStart={handleProjectDragStart}
                onDragEnd={handleProjectDragEnd}
                onDragOver={handleProjectDragOver}
                onDrop={handleProjectDrop}
              />
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DraggableProjectTable;