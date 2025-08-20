import React from 'react';
import { Plus, X, Edit2, Check } from 'lucide-react';
import type { Column } from '@/shared/hooks/useColumnOrder';

interface TableHeaderProps {
  column: Column;
  width: number;
  isDraggable: boolean;
  isResizable: boolean;
  isMemoColumn: boolean;
  isEditing: boolean;
  editingName: string;
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  editInputRef: React.RefObject<HTMLInputElement>;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onSort: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onRemove: () => void;
  onEditNameChange: (name: string) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onAddMemo?: () => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  column,
  width,
  isDraggable,
  isResizable,
  isMemoColumn,
  isEditing,
  editingName,
  sortField,
  sortDirection,
  editInputRef,
  onDragStart,
  onDragOver,
  onDrop,
  onSort,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onRemove,
  onEditNameChange,
  onMouseDown,
  onAddMemo
}) => {
  const getSortIcon = () => {
    if (sortField !== column.id) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <th
      key={column.id}
      className={`border-b px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 ${
        column.id === 'checkbox' ? 'w-10' : ''
      } ${column.id === 'options' ? 'w-12' : ''} ${
        isDraggable ? 'cursor-move' : ''
      } ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
      style={{ 
        width, 
        minWidth: width,
        position: 'relative'
      }}
      draggable={isDraggable}
      onDragStart={isDraggable ? onDragStart : undefined}
      onDragOver={isDraggable ? onDragOver : undefined}
      onDrop={isDraggable ? onDrop : undefined}
      onClick={column.sortable && !isMemoColumn ? onSort : undefined}
    >
      <div className="flex items-center justify-between">
        {isMemoColumn && isEditing ? (
          <div className="flex items-center gap-1 flex-1">
            <input
              ref={editInputRef}
              type="text"
              value={editingName}
              onChange={(e) => onEditNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveEdit();
                if (e.key === 'Escape') onCancelEdit();
              }}
              className="px-1 py-0.5 text-xs border rounded flex-1 min-w-[60px]"
              placeholder="메모 이름"
            />
            <button
              onClick={onSaveEdit}
              className="p-0.5 hover:bg-gray-200 rounded"
              title="저장"
            >
              <Check className="w-3 h-3 text-green-600" />
            </button>
            <button
              onClick={onCancelEdit}
              className="p-0.5 hover:bg-gray-200 rounded"
              title="취소"
            >
              <X className="w-3 h-3 text-gray-600" />
            </button>
          </div>
        ) : (
          <>
            <span className="select-none">
              {column.label}
              {column.sortable && !isMemoColumn && (
                <span className="ml-1">{getSortIcon()}</span>
              )}
            </span>
            {isMemoColumn && (
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartEdit();
                  }}
                  className="p-0.5 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="이름 변경"
                >
                  <Edit2 className="w-3 h-3 text-gray-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="p-0.5 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="삭제"
                >
                  <X className="w-3 h-3 text-red-600" />
                </button>
              </div>
            )}
            {column.id === 'addMemo' && onAddMemo && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddMemo();
                }}
                className="p-1 hover:bg-gray-200 rounded"
                title="메모 추가"
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
          </>
        )}
      </div>
      {isResizable && (
        <div
          className="resize-handle"
          onMouseDown={onMouseDown}
        />
      )}
    </th>
  );
};