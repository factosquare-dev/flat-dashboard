import React, { useState, useRef } from 'react';
import type { Project } from '../../../types/project';
import type { ProjectId } from '../../../types/branded';
import ProjectTableRow from './ProjectTableRow/index';
import { useColumnOrder } from '@/hooks/useColumnOrder';
import type { Column } from '../../../hooks/useColumnOrder';
import { useColumnResize } from '@/hooks/useColumnResize';
import { useMemoColumns } from '@/hooks/useMemoColumns';
import { Plus, X, Edit2, Check } from 'lucide-react';
import { ProjectType, TableColumnId } from '@/types/enums';
import { isProjectType } from '@/utils/projectTypeUtils';
import { useProjectHierarchy } from '@/hooks/useProjectHierarchy';
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
  onUpdateProject: <K extends keyof Project>(projectId: ProjectId, field: K, value: Project[K]) => void;
  onShowOptionsMenu: (projectId: ProjectId, position: { top: number; left: number }, event?: React.MouseEvent) => void;
  onMouseEnterRow?: (index: number) => void;
  isDragging?: boolean;
  onStartDrag?: (index: number) => void;
  onDragStart?: (projectId: string) => void;
  onDragEnd?: () => void;
  onToggleMaster?: (projectId: string) => void;
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
  onDragEnd,
  onToggleMaster
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
  
  const { memoColumns, addMemoColumn, removeMemoColumn, updateMemoColumnName } = useMemoColumns();
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [editingMemoName, setEditingMemoName] = useState<string>('');
  
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const { moveToMaster, makeIndependent, canBeMoved, canAcceptChildren } = useProjectHierarchy();
  const tableRef = useRef<HTMLTableElement>(null);

  // Filter out hidden columns and any undefined values
  const visibleColumns = columns.filter(col => col && !hiddenColumns.has(col.id));

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
  
  const handleProjectDragLeave = (e: React.DragEvent) => {
    // 드래그가 떠날 때 처리
  };

  const handleProjectDrop = (e: React.DragEvent, targetProject?: Project) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Case: Drop on empty space (no target)
    if (!targetProject) {
      if (!draggedProjectId) {
        setDraggedProjectId(null);
        return;
      }
      
      const draggedProject = projects.find(p => p.id === draggedProjectId);
      if (!draggedProject || !draggedProject.parentId) {
        setDraggedProjectId(null);
        return;
      }
      
      makeIndependent(draggedProjectId);
      setDraggedProjectId(null);
      return;
    }
    
    // 자기 자신에게 드롭하면 무시
    if (!draggedProjectId || draggedProjectId === targetProject.id) {
      setDraggedProjectId(null);
      return;
    }
    
    // Find dragged project
    const draggedProject = projects.find(p => p.id === draggedProjectId);
    if (!draggedProject) {
      setDraggedProjectId(null);
      return;
    }
    
    // Case 1: SUB → MASTER
    if (isProjectType(targetProject.type, ProjectType.MASTER)) {
      if (draggedProject.parentId === targetProject.id) {
        setDraggedProjectId(null);
        return;
      }
      
      moveToMaster(draggedProjectId, targetProject.id);
      setDraggedProjectId(null);
      return;
    }
    
    // Case 2: SUB → SUB (different groups)
    if (isProjectType(targetProject.type, ProjectType.SUB)) {
      // Case 2a: Target SUB is in a MASTER group
      if (targetProject.parentId) {
        if (draggedProject.parentId === targetProject.parentId) {
          setDraggedProjectId(null);
          return;
        }
        
        moveToMaster(draggedProjectId, targetProject.parentId);
        setDraggedProjectId(null);
        return;
      }
      
      // Case 2b: Target SUB is independent
      if (!targetProject.parentId) {
        if (!draggedProject.parentId) {
          setDraggedProjectId(null);
          return;
        }
        
        makeIndependent(draggedProjectId);
        setDraggedProjectId(null);
        return;
      }
    }
    
    setDraggedProjectId(null);
  };

  const handleStartEditMemo = (columnId: string, columnLabel: string) => {
    console.log('[DraggableProjectTable] Starting memo edit:', columnId, columnLabel);
    setEditingMemoId(columnId);
    setEditingMemoName(columnLabel);
  };

  const handleSaveMemoName = (columnId: string) => {
    console.log('[DraggableProjectTable] Saving memo name:', columnId, editingMemoName);
    if (editingMemoName.trim()) {
      updateMemoColumnName(columnId, editingMemoName.trim());
    }
    setEditingMemoId(null);
    setEditingMemoName('');
  };

  const handleCancelEditMemo = () => {
    console.log('[DraggableProjectTable] Canceling memo edit');
    setEditingMemoId(null);
    setEditingMemoName('');
  };
  
  const handleAddMemoColumn = () => {
    console.log('[DraggableProjectTable] Add memo column button clicked');
    addMemoColumn();
  };
  
  const handleRemoveMemoColumn = (columnId: string) => {
    console.log('[DraggableProjectTable] Remove memo column button clicked:', columnId);
    removeMemoColumn(columnId);
  };

  const renderHeaderCell = (column: Column) => {
    const isDraggable = column.id !== 'checkbox' && column.id !== 'options' && !isResizing;
    const isResizable = column.id !== 'checkbox' && column.id !== 'options';
    const width = getColumnWidth(column.id, column.width);
    const isMemoColumn = column.id.startsWith('memo-');
    const isEditingThisMemo = editingMemoId === column.id;
    
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
        draggable={isDraggable && !isEditingThisMemo}
        onDragStart={isDraggable && !isEditingThisMemo ? () => handleDragStart(column.id) : undefined}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={isDraggable ? (e) => handleDrop(e, column.id) : undefined}
        onClick={column.sortable && !isResizing && !isEditingThisMemo ? () => onSort(column.id as keyof Project) : undefined}
      >
        <div className={`flex items-center ${
          column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : 'justify-between'
        } overflow-hidden`}>
          {isMemoColumn && isEditingThisMemo ? (
            <div className="flex items-center gap-1 w-full">
              <input
                type="text"
                value={editingMemoName}
                onChange={(e) => setEditingMemoName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveMemoName(column.id);
                  } else if (e.key === 'Escape') {
                    handleCancelEditMemo();
                  }
                }}
                className="flex-1 px-1 py-0.5 text-xs border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveMemoName(column.id);
                }}
                className="p-0.5 text-green-600 hover:bg-green-50 rounded"
                title="저장"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelEditMemo();
                }}
                className="p-0.5 text-red-600 hover:bg-red-50 rounded"
                title="취소"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <>
              <span className="truncate">{column.label}</span>
              {isMemoColumn && (
                <div className="flex items-center gap-1 ml-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEditMemo(column.id, column.label);
                    }}
                    className="p-0.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="이름 편집"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveMemoColumn(column.id);
                    }}
                    className="p-0.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                    title="메모 삭제"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {column.sortable && sortField === column.id && (
                <span className="text-blue-600 ml-1 flex-shrink-0">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </>
          )}
        </div>
        {isResizable && !isEditingThisMemo && (
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


  // 모든 데이터 컬럼이 숨겨진 경우 처리
  if (visibleColumns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <p className="text-lg font-medium mb-2">표시할 열이 없습니다</p>
        <p className="text-sm">열 표시 설정에서 표시할 열을 선택해주세요</p>
      </div>
    );
  }

  return (
    <div style={{ width: 'max-content', minWidth: '100%' }}>
      <table ref={tableRef} role="table" style={{ width: 'max-content', minWidth: '1950px' }}>
        <thead className="sticky top-0 z-20 bg-white border-b border-gray-200">
          <tr role="row">
            <th className="w-16 px-1 py-1.5 text-left bg-white" scope="col">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  onChange={(e) => onSelectAll(e.target.checked)}
                  checked={projects.length > 0 && selectedRows.length === projects.filter(p => isProjectType(p.type, ProjectType.TASK)).length}
                />
              </div>
            </th>
            {visibleColumns.map((column, idx) => {
              // Find all memo columns and check if this is the last one
              const memoColumnIndices = visibleColumns
                .map((col, i) => col.id.startsWith('memo-') ? i : -1)
                .filter(i => i !== -1);
              
              const isLastMemoColumn = memoColumnIndices.length > 0 && 
                idx === memoColumnIndices[memoColumnIndices.length - 1];
              
              // If no memo columns exist, show button after LAB_NUMBER
              const isLabNumberColumn = column.id === TableColumnId.LAB_NUMBER;
              const shouldShowAddButton = isLastMemoColumn || 
                (isLabNumberColumn && memoColumnIndices.length === 0);
              
              return (
                <React.Fragment key={column.id}>
                  {renderHeaderCell(column)}
                  {/* Add button after last memo column, or after LAB_NUMBER if no memos */}
                  {shouldShowAddButton && (
                    <th className="table-header-cell text-center w-12 bg-white" scope="col">
                      <button
                        onClick={handleAddMemoColumn}
                        className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="메모 추가"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </th>
                  )}
                </React.Fragment>
              );
            })}
            <th className="table-header-cell text-center w-12 bg-white" scope="col">
              <span className="sr-only">프로젝트 옵션</span>
              <svg className="w-4 h-4 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </th>
          </tr>
        </thead>
        <tbody 
          className="divide-y divide-gray-100"
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
          }}
          onDrop={(e) => {
            // Only handle if not dropped on a specific row
            if (e.target === e.currentTarget || !e.currentTarget.contains(e.target as Node)) {
              handleProjectDrop(e);
            }
          }}
        >
          {projects?.map((project, index) => (
            <React.Fragment key={project.id}>
              <ProjectTableRow
                project={project}
                index={index}
                columns={visibleColumns}
                isSelected={(() => {
                  if (isProjectType(project.type, ProjectType.MASTER)) {
                    // For Master projects, check if all children are selected
                    const children = projects.filter(p => p.parentId === project.id);
                    if (children.length === 0) {
                      return selectedRows.includes(project.id);
                    }
                    // Master is selected if all its children are selected
                    const allChildrenSelected = children.every(child => selectedRows.includes(child.id));
                    return allChildrenSelected && selectedRows.includes(project.id);
                  }
                  return selectedRows.includes(project.id);
                })()}
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
                onDrop={(e) => handleProjectDrop(e, project)}
                onToggleMaster={onToggleMaster}
              />
            </React.Fragment>
          ))}
          {/* Empty space drop zone */}
          <tr 
            className="h-20"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleProjectDrop(e);
            }}
          >
            <td colSpan={visibleColumns.length + 2 + (visibleColumns.some(col => col.id === TableColumnId.LAB_NUMBER || col.id.startsWith('memo-')) ? 1 : 0)} className="text-center text-gray-400 text-xs">
              {draggedProjectId && (
                <div className="py-4 border-2 border-dashed border-gray-300 rounded">
                  Drop here to make independent
                </div>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DraggableProjectTable;