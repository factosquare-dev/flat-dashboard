import React, { useState, useEffect } from 'react';
import { TableColumnId } from '@/types/enums';
import { useMemoColumns } from './useMemoColumns';

export interface Column {
  id: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  isMemo?: boolean;
}

// Type guard for Column validation with runtime type checking
const isValidColumn = (obj: any): obj is Column => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.label === 'string' &&
    (obj.sortable === undefined || typeof obj.sortable === 'boolean') &&
    (obj.align === undefined || ['left', 'center', 'right'].includes(obj.align)) &&
    (obj.width === undefined || typeof obj.width === 'string')
  );
};

// Type guard for Column array validation
const isValidColumnArray = (arr: any): arr is Column[] => {
  return Array.isArray(arr) && arr.every(isValidColumn);
};

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
  const { memoColumns } = useMemoColumns();
  
  const [baseColumns, setBaseColumns] = useState<Column[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Runtime type validation using type guard
        if (isValidColumnArray(parsed)) {
          // Filter out old memo columns (they're managed separately now) and any undefined/null values
          const nonMemoColumns = parsed.filter(col => col && !col.isMemo && col.id !== TableColumnId.MEMO);
          // 새로운 컬럼이 추가된 경우를 대비하여 머지
          const savedIds = nonMemoColumns.map(col => col.id);
          const newColumns = DEFAULT_COLUMNS.filter(col => !savedIds.includes(col.id));
          // Filter out any undefined values before returning
          return [...nonMemoColumns, ...newColumns].filter(col => col != null);
        } else {
          return DEFAULT_COLUMNS;
        }
      } catch (error) {
        return DEFAULT_COLUMNS;
      }
    }
    return DEFAULT_COLUMNS;
  });

  // Combine base columns with memo columns
  // Insert memo columns after LAB_NUMBER
  const columns = React.useMemo(() => {
    // Filter out any undefined memo columns
    const validMemoColumns = (memoColumns || []).filter(col => col != null);
    
    const labNumberIndex = baseColumns.findIndex(col => col.id === TableColumnId.LAB_NUMBER);
    if (labNumberIndex === -1) {
      return [...baseColumns, ...validMemoColumns];
    }
    
    const before = baseColumns.slice(0, labNumberIndex + 1);
    const after = baseColumns.slice(labNumberIndex + 1);
    return [...before, ...validMemoColumns, ...after];
  }, [baseColumns, memoColumns]);

  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);

  useEffect(() => {
    // Only save non-memo columns to avoid duplication
    const nonMemoColumns = baseColumns.filter(col => col && !col.isMemo);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nonMemoColumns));
  }, [baseColumns]);

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

    // Don't allow dragging memo columns (they have fixed positions)
    if (draggedColumn.startsWith('memo-') || targetColumnId.startsWith('memo-')) return;

    const draggedIndex = baseColumns.findIndex(col => col && col.id === draggedColumn);
    const targetIndex = baseColumns.findIndex(col => col && col.id === targetColumnId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newColumns = [...baseColumns];
    const [removed] = newColumns.splice(draggedIndex, 1);
    if (removed) {  // Only insert if we actually removed something
      newColumns.splice(targetIndex, 0, removed);
      setBaseColumns(newColumns);
    }
  };

  const resetColumnOrder = () => {
    setBaseColumns(DEFAULT_COLUMNS);
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