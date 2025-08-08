import { useState, useEffect } from 'react';
import { Column } from './useColumnOrder';

const MEMO_COLUMNS_KEY = 'project-memo-columns';
const MAX_MEMO_COLUMNS = 10;

export interface MemoColumn extends Column {
  isMemo: true;
}

export const useMemoColumns = () => {
  const [memoColumns, setMemoColumns] = useState<MemoColumn[]>(() => {
    const saved = localStorage.getItem(MEMO_COLUMNS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse memo columns:', e);
      }
    }
    // Default 3 memo columns
    return [
      { id: 'memo-1', label: '메모 1', sortable: false, width: '150px', isMemo: true },
      { id: 'memo-2', label: '메모 2', sortable: false, width: '150px', isMemo: true },
      { id: 'memo-3', label: '메모 3', sortable: false, width: '150px', isMemo: true },
    ];
  });

  useEffect(() => {
    localStorage.setItem(MEMO_COLUMNS_KEY, JSON.stringify(memoColumns));
  }, [memoColumns]);

  const addMemoColumn = () => {
    if (memoColumns.length >= MAX_MEMO_COLUMNS) {
      alert(`최대 ${MAX_MEMO_COLUMNS}개의 메모 컬럼만 추가할 수 있습니다.`);
      return;
    }

    const newColumn: MemoColumn = {
      id: `memo-${Date.now()}`,
      label: `메모 ${memoColumns.length + 1}`,
      sortable: false,
      width: '150px',
      isMemo: true
    };

    setMemoColumns([...memoColumns, newColumn]);
  };

  const removeMemoColumn = (columnId: string) => {
    if (memoColumns.length <= 1) {
      alert('최소 1개의 메모 컬럼은 유지해야 합니다.');
      return;
    }

    setMemoColumns(memoColumns.filter(col => col.id !== columnId));
  };

  const updateMemoColumnName = (columnId: string, newName: string) => {
    setMemoColumns(memoColumns.map(col =>
      col.id === columnId ? { ...col, label: newName } : col
    ));
  };

  const resetMemoColumns = () => {
    setMemoColumns([
      { id: 'memo-1', label: '메모 1', sortable: false, width: '150px', isMemo: true },
      { id: 'memo-2', label: '메모 2', sortable: false, width: '150px', isMemo: true },
      { id: 'memo-3', label: '메모 3', sortable: false, width: '150px', isMemo: true },
    ]);
  };

  return {
    memoColumns,
    addMemoColumn,
    removeMemoColumn,
    updateMemoColumnName,
    resetMemoColumns
  };
};