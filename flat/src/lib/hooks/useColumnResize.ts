import { useState, useCallback, useRef, useEffect } from 'react';

interface ColumnWidth {
  [columnId: string]: number;
}

const STORAGE_KEY = 'projectTableColumnWidths';

export const useColumnResize = () => {
  const [columnWidths, setColumnWidths] = useState<ColumnWidth>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  });

  const [resizing, setResizing] = useState<{
    columnId: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizing) return;

    try {
      const diff = e.clientX - resizing.startX;
      const newWidth = Math.max(50, Math.min(800, resizing.startWidth + diff)); // 최대 800px 제한

      setColumnWidths(prev => ({
        ...prev,
        [resizing.columnId]: newWidth
      }));
    } catch (error) {
      // Error during column resize
      setResizing(null);
      document.body.classList.remove('resizing');
    }
  }, [resizing]);

  const handleMouseUp = useCallback(() => {
    setResizing(null);
    // Remove resizing class from body
    document.body.classList.remove('resizing');
  }, []);

  useEffect(() => {
    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizing, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columnWidths));
  }, [columnWidths]);

  const startResize = useCallback((columnId: string, startX: number, startWidth: number) => {
    setResizing({ columnId, startX, startWidth });
  }, []);

  const getColumnWidth = useCallback((columnId: string, defaultWidth?: string) => {
    if (columnWidths[columnId]) {
      return `${columnWidths[columnId]}px`;
    }
    return defaultWidth;
  }, [columnWidths]);

  const resetColumnWidths = useCallback(() => {
    setColumnWidths({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    columnWidths,
    startResize,
    getColumnWidth,
    resetColumnWidths,
    isResizing: !!resizing
  };
};