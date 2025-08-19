import { useState, useEffect } from 'react';
import { TableColumnId } from '@/types/enums';
import { useColumnOrder } from './useColumnOrder';

interface ColumnVisibility {
  [columnId: string]: boolean;
}

const STORAGE_KEY = 'projectTableColumnVisibility';

export const useColumnVisibility = () => {
  const { columns } = useColumnOrder();
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return new Set(parsed);
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(hiddenColumns)));
  }, [hiddenColumns]);

  const toggleColumn = (columnId: string) => {
    setHiddenColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnId)) {
        newSet.delete(columnId);
      } else {
        newSet.add(columnId);
      }
      return newSet;
    });
  };

  const isColumnVisible = (columnId: string) => {
    return !hiddenColumns.has(columnId);
  };

  const showAllColumns = () => {
    setHiddenColumns(new Set());
  };

  const hideAllColumns = () => {
    // Hide ALL columns including memo columns
    const allColumnIds = columns.map(col => col.id);
    setHiddenColumns(new Set(allColumnIds));
  };

  const areAllColumnsHidden = () => {
    // Check if all columns including memo columns are hidden
    const allColumnIds = columns.map(col => col.id);
    return allColumnIds.every(columnId => hiddenColumns.has(columnId));
  };

  return {
    hiddenColumns,
    toggleColumn,
    isColumnVisible,
    showAllColumns,
    hideAllColumns,
    areAllColumnsHidden
  };
};