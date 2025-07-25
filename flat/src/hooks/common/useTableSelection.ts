/**
 * Table row selection hook
 * Handles single and multiple row selection
 */

import { useState, useCallback, useMemo } from 'react';

interface UseTableSelectionOptions {
  multiple?: boolean;
  initialSelection?: string[];
}

interface UseTableSelectionReturn {
  selectedIds: Set<string>;
  selectedArray: string[];
  isSelected: (id: string) => boolean;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  toggleSelection: (id: string) => void;
  toggleAll: (ids: string[]) => void;
  selectAll: (ids: string[]) => void;
  deselectAll: () => void;
  setSelection: (ids: string[]) => void;
}

export function useTableSelection({
  multiple = true,
  initialSelection = [],
}: UseTableSelectionOptions = {}): UseTableSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialSelection)
  );

  const selectedArray = useMemo(() => Array.from(selectedIds), [selectedIds]);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  const toggleSelection = useCallback(
    (id: string) => {
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        
        if (!multiple) {
          // Single selection mode
          newSet.clear();
          if (!prev.has(id)) {
            newSet.add(id);
          }
        } else {
          // Multiple selection mode
          if (newSet.has(id)) {
            newSet.delete(id);
          } else {
            newSet.add(id);
          }
        }
        
        return newSet;
      });
    },
    [multiple]
  );

  const toggleAll = useCallback((ids: string[]) => {
    setSelectedIds(prev => {
      const allSelected = ids.every(id => prev.has(id));
      
      if (allSelected) {
        // Deselect all provided ids
        const newSet = new Set(prev);
        ids.forEach(id => newSet.delete(id));
        return newSet;
      } else {
        // Select all provided ids
        return new Set([...prev, ...ids]);
      }
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(prev => new Set([...prev, ...ids]));
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const setSelection = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  // Calculate selection states for a given set of ids
  const getSelectionState = useCallback(
    (ids: string[]) => {
      const selectedCount = ids.filter(id => selectedIds.has(id)).length;
      const isAllSelected = selectedCount === ids.length && ids.length > 0;
      const isIndeterminate = selectedCount > 0 && selectedCount < ids.length;
      
      return { isAllSelected, isIndeterminate };
    },
    [selectedIds]
  );

  // Default to empty array for state calculation
  const { isAllSelected, isIndeterminate } = getSelectionState([]);

  return {
    selectedIds,
    selectedArray,
    isSelected,
    isAllSelected,
    isIndeterminate,
    toggleSelection,
    toggleAll,
    selectAll,
    deselectAll,
    setSelection,
  };
}