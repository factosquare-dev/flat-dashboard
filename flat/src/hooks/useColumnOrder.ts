import { useState, useEffect } from 'react';

export interface Column {
  id: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
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
  { id: 'productType', label: '제품유형', sortable: true, width: 'w-32' },
  { id: 'client', label: '고객명', sortable: true, width: 'w-32' },
  { id: 'serviceType', label: '서비스', sortable: true, width: 'w-28' },
  { id: 'currentStage', label: '진행단계', width: 'w-40' },
  { id: 'status', label: '상태', sortable: true, width: 'w-28' },
  { id: 'progress', label: '진행률', align: 'center', width: 'w-40' },
  { id: 'startDate', label: '시작일', sortable: true, align: 'center', width: 'w-24' },
  { id: 'endDate', label: '마감일', sortable: true, align: 'center', width: 'w-24' },
  { id: 'manufacturer', label: '제조', width: 'w-28' },
  { id: 'container', label: '용기', width: 'w-28' },
  { id: 'packaging', label: '포장', width: 'w-28' },
  { id: 'sales', label: '매출', align: 'right', width: 'w-28' },
  { id: 'purchase', label: '매입', align: 'right', width: 'w-28' },
  { id: 'depositPaid', label: '선금입금', align: 'center', width: 'w-24' },
  { id: 'priority', label: '우선순위', sortable: true, align: 'center', width: 'w-24' }
];

const STORAGE_KEY = 'projectTableColumnOrder';

export const useColumnOrder = () => {
  const [columns, setColumns] = useState<Column[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Runtime type validation using type guard
        if (isValidColumnArray(parsed)) {
          // 새로운 컬럼이 추가된 경우를 대비하여 머지
          const savedIds = parsed.map(col => col.id);
          const newColumns = DEFAULT_COLUMNS.filter(col => !savedIds.includes(col.id));
          return [...parsed, ...newColumns];
        } else {
          return DEFAULT_COLUMNS;
        }
      } catch (error) {
        return DEFAULT_COLUMNS;
      }
    }
    return DEFAULT_COLUMNS;
  });

  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);

  useEffect(() => {
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

    const draggedIndex = columns.findIndex(col => col.id === draggedColumn);
    const targetIndex = columns.findIndex(col => col.id === targetColumnId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newColumns = [...columns];
    const [removed] = newColumns.splice(draggedIndex, 1);
    newColumns.splice(targetIndex, 0, removed);

    setColumns(newColumns);
  };

  const resetColumnOrder = () => {
    setColumns(DEFAULT_COLUMNS);
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