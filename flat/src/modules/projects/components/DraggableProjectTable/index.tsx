import React, { useRef, useEffect } from 'react';
import ProjectTableRow from '../ProjectTableRow/index';
import { TableHeader } from './TableHeader';
import { useColumnOrder } from '@/shared/hooks/useColumnOrder';
import { useColumnResize } from '@/shared/hooks/useColumnResize';
import { useDragHandlers } from './hooks/useDragHandlers';
import { useMemoHandlers } from './hooks/useMemoHandlers';
import { ProjectType } from '@/shared/types/enums';
import { isProjectType } from '@/shared/utils/projectTypeUtils';
import type { DraggableProjectTableProps } from './types';
import '@/shared/styles/tableResize.css';

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
  onDragEnd,
  onToggleMaster
}) => {
  const tableRef = useRef<HTMLTableElement>(null);

  // Column management
  const {
    columns,
    moveColumn,
    startDrag,
    endDrag,
    dragOver,
    drop,
    isDragging: isColumnDragging
  } = useColumnOrder();

  // Column resizing
  const {
    getColumnWidth,
    handleMouseDown,
    isResizing
  } = useColumnResize(columns);

  // Memo columns management
  const {
    memoColumns,
    editingMemoId,
    editingMemoName,
    editInputRef,
    handleStartEditMemo,
    handleSaveMemoName,
    handleCancelEditMemo,
    handleAddMemoColumn,
    handleRemoveMemoColumn,
    setEditingMemoName
  } = useMemoHandlers();

  // Drag and drop handlers
  const {
    draggedProjectId,
    handleProjectDragStart,
    handleProjectDragEnd,
    handleProjectDragOver,
    handleProjectDragLeave,
    handleProjectDrop
  } = useDragHandlers(projects, onDragStart, onDragEnd);

  // Filter visible columns
  const visibleColumns = columns.filter(col => col && !hiddenColumns.has(col.id));

  // Calculate selection state
  const isAllSelected = projects.length > 0 && selectedRows.length === projects.length;
  const isPartiallySelected = selectedRows.length > 0 && selectedRows.length < projects.length;

  // Handle click outside for memo editing
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (editingMemoId && editInputRef.current && !editInputRef.current.contains(e.target as Node)) {
        handleCancelEditMemo();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editingMemoId, handleCancelEditMemo, editInputRef]);

  const renderHeaderCell = (column: any) => {
    const isDraggable = column.id !== 'checkbox' && column.id !== 'options' && !isResizing;
    const isResizable = column.id !== 'checkbox' && column.id !== 'options';
    const width = getColumnWidth(column.id, column.width);
    const isMemoColumn = column.id.startsWith('memo-');

    if (column.id === 'checkbox') {
      return (
        <th
          key={column.id}
          className="border-b px-3 py-2 bg-gray-50 w-10"
          style={{ width, minWidth: width }}
        >
          <input
            type="checkbox"
            checked={isAllSelected}
            indeterminate={isPartiallySelected}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="rounded border-gray-300"
          />
        </th>
      );
    }

    if (column.id === 'options') {
      return (
        <th
          key={column.id}
          className="border-b px-3 py-2 bg-gray-50 w-12"
          style={{ width, minWidth: width }}
        >
          <span className="sr-only">Options</span>
        </th>
      );
    }

    return (
      <TableHeader
        key={column.id}
        column={column}
        width={width}
        isDraggable={isDraggable}
        isResizable={isResizable}
        isMemoColumn={isMemoColumn}
        isEditing={editingMemoId === column.id}
        editingName={editingMemoName}
        sortField={sortField as string}
        sortDirection={sortDirection}
        editInputRef={editInputRef}
        onDragStart={(e) => startDrag(e, column.id)}
        onDragOver={dragOver}
        onDrop={(e) => drop(e, column.id)}
        onSort={() => column.field && onSort(column.field)}
        onStartEdit={() => handleStartEditMemo(column.id, column.label)}
        onSaveEdit={() => handleSaveMemoName(column.id)}
        onCancelEdit={handleCancelEditMemo}
        onRemove={() => handleRemoveMemoColumn(column.id)}
        onEditNameChange={setEditingMemoName}
        onMouseDown={(e) => handleMouseDown(e, column.id)}
        onAddMemo={column.id === 'addMemo' ? handleAddMemoColumn : undefined}
      />
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <table ref={tableRef} className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr className="group">
            {visibleColumns.map(renderHeaderCell)}
          </tr>
        </thead>
        <tbody 
          className="bg-white divide-y divide-gray-200"
          onDragOver={handleProjectDragOver}
          onDrop={(e) => handleProjectDrop(e)}
        >
          {projects.map((project, index) => {
            const isDraggable = isProjectType(project, ProjectType.SUB);
            const canReceiveDrop = isProjectType(project, ProjectType.MASTER) && 
                                  draggedProjectId && 
                                  draggedProjectId !== project.id;

            return (
              <ProjectTableRow
                key={project.id}
                project={project}
                columns={visibleColumns}
                index={index}
                isSelected={selectedRows.includes(project.id)}
                onSelect={(checked) => onSelectRow(project.id, checked, index)}
                onRowClick={onSelectProject}
                onUpdateField={onUpdateProject}
                onShowOptionsMenu={onShowOptionsMenu}
                onMouseEnter={() => onMouseEnterRow?.(index)}
                isDragging={isDragging}
                onStartDrag={onStartDrag}
                onDragStart={(e) => handleProjectDragStart(e, project.id)}
                onDragEnd={handleProjectDragEnd}
                onDragOver={handleProjectDragOver}
                onDrop={(e) => handleProjectDrop(e, project)}
                onToggleMaster={onToggleMaster}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DraggableProjectTable;