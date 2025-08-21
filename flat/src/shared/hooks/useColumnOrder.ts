import React, { useState, useEffect } from 'react';
import { TableColumnId } from '@/shared/types/enums';
import { Column, isValidColumn, isValidColumnArray } from '@/shared/types/column';
import { useMemoColumns } from './useMemoColumns';

const DEFAULT_COLUMNS: Column[] = [
  { id: TableColumnId.NAME, label: '프로젝트명', sortable: true, width: '200px' },
  { id: TableColumnId.LAB_NUMBER, label: '확정랩넘버', sortable: true, width: '120px' },
  // Memo columns will be inserted here dynamically
  { id: TableColumnId.PRODUCT_TYPE, label: '제품유형', sortable: true, width: '130px' },
  { id: TableColumnId.CLIENT, label: '고객명', sortable: true, width: '120px' },
  { id: TableColumnId.SERVICE_TYPE, label: '서비스', sortable: true, width: '110px' },
  { id: TableColumnId.CURRENT_STAGE, label: '진행단계', width: '150px' },
  { id: TableColumnId.STATUS, label: '상태', sortable: true, width: '90px' },
  { id: TableColumnId.PROGRESS, label: '진행률', sortable: true, align: 'center', width: '130px' },
  { id: TableColumnId.START_DATE, label: '시작일', sortable: true, align: 'center', width: '100px' },
  { id: TableColumnId.END_DATE, label: '마감일', sortable: true, align: 'center', width: '100px' },
  { id: TableColumnId.MANUFACTURER, label: '제조', width: '110px' },
  { id: TableColumnId.CONTAINER, label: '용기', width: '110px' },
  { id: TableColumnId.PACKAGING, label: '포장', width: '110px' },
  { id: TableColumnId.SALES, label: '매출', sortable: true, align: 'right', width: '110px' },
  { id: TableColumnId.PURCHASE, label: '매입', sortable: true, align: 'right', width: '110px' },
  { id: TableColumnId.DEPOSIT_PAID, label: '선금입금', sortable: true, align: 'center', width: '90px' },
  { id: TableColumnId.PRIORITY, label: '우선순위', sortable: true, align: 'center', width: '90px' }
];

const STORAGE_KEY = 'projectTableColumnOrder';

export const useColumnOrder = () => {
  const { memoColumns, reorderMemoColumns } = useMemoColumns();
  
  const [allColumns, setAllColumns] = useState<Column[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Runtime type validation using type guard
        if (isValidColumnArray(parsed)) {
          // Include both regular and memo columns from saved state
          const savedColumns = parsed.filter(col => col != null);
          
          // Check if we need to add any new default columns
          const savedIds = savedColumns.map(col => col.id);
          const newColumns = DEFAULT_COLUMNS.filter(col => !savedIds.includes(col.id));
          
          // Merge saved columns with any new default columns
          return [...savedColumns, ...newColumns].filter(col => col != null);
        } else {
          return DEFAULT_COLUMNS;
        }
      } catch (error) {
        return DEFAULT_COLUMNS;
      }
    }
    
    // If no saved state, combine default columns with memo columns at the end
    return [...DEFAULT_COLUMNS, ...memoColumns];
  });

  // Sync memo columns from context if they don't exist in allColumns
  const columns = React.useMemo(() => {
    // Check if all memo columns from context are in allColumns
    const existingMemoIds = allColumns.filter(col => col.id.startsWith('memo-')).map(col => col.id);
    const contextMemoIds = memoColumns.map(col => col.id);
    
    // If memo columns have changed (added/removed), update allColumns
    const missingMemos = memoColumns.filter(memo => !existingMemoIds.includes(memo.id));
    const removedMemoIds = existingMemoIds.filter(id => !contextMemoIds.includes(id));
    
    if (missingMemos.length > 0 || removedMemoIds.length > 0) {
      // Remove deleted memo columns and add new ones
      let updatedColumns = allColumns.filter(col => !removedMemoIds.includes(col.id));
      
      // Add missing memo columns at the end (right before the + button)
      if (missingMemos.length > 0) {
        updatedColumns.push(...missingMemos);
      }
      
      setAllColumns(updatedColumns);
      return updatedColumns;
    }
    
    // Update memo column labels if they changed
    const updatedColumns = allColumns.map(col => {
      if (col.id.startsWith('memo-')) {
        const memoCol = memoColumns.find(m => m.id === col.id);
        if (memoCol && memoCol.label !== col.label) {
          return { ...col, label: memoCol.label };
        }
      }
      return col;
    });
    
    if (JSON.stringify(updatedColumns) !== JSON.stringify(allColumns)) {
      setAllColumns(updatedColumns);
      return updatedColumns;
    }
    
    return allColumns;
  }, [allColumns, memoColumns]);

  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);

  useEffect(() => {
    // Save all columns including their current positions
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
  }, [columns]);

  const handleDragStart = (columnId: string) => {
    setDraggedColumn(columnId);
  };

  const handleDragEnd = () => {
    setDraggedColumn(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    
    if (!draggedColumn || draggedColumn === targetColumnId) return;

    // Find the dragged and target columns in the columns array
    const draggedIndex = columns.findIndex(col => col && col.id === draggedColumn);
    const targetIndex = columns.findIndex(col => col && col.id === targetColumnId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Create a new array with the dragged column moved to the target position
    const newColumns = [...columns];
    const [removed] = newColumns.splice(draggedIndex, 1);
    newColumns.splice(targetIndex, 0, removed);
    
    // Update the state with the new column order
    setAllColumns(newColumns);
    
    // If both are memo columns, also update their order in MemoContext
    const isDraggedMemo = draggedColumn.startsWith('memo-');
    const isTargetMemo = targetColumnId.startsWith('memo-');
    
    if (isDraggedMemo && isTargetMemo) {
      reorderMemoColumns(draggedColumn, targetColumnId);
    }
  };

  const resetColumnOrder = () => {
    // Reset to default columns with memo columns at the end
    setAllColumns([...DEFAULT_COLUMNS, ...memoColumns]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    columns,
    draggedColumn,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    resetColumnOrder
  };
};