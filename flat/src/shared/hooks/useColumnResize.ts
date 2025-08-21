import React, { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from '@/shared/utils/logger';
import { getStorageItem, setStorageItem, removeStorageItem } from '@/shared/utils/storage';

interface ColumnWidth {
  [columnId: string]: number;
}

const STORAGE_KEY = 'projectTableColumnWidths';
const MIN_COLUMN_WIDTH = 50;
const MAX_COLUMN_WIDTH = 800;

export const useColumnResize = () => {
  const [columnWidths, setColumnWidths] = useState<ColumnWidth>(() => {
    return getStorageItem<ColumnWidth>(STORAGE_KEY) || {};
  });

  const [resizing, setResizing] = useState<{
    columnId: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizing) return;

    try {
      const diff = e.pageX - resizing.startX;
      const newWidth = Math.max(MIN_COLUMN_WIDTH, Math.min(MAX_COLUMN_WIDTH, resizing.startWidth + diff));

      setColumnWidths(prev => ({
        ...prev,
        [resizing.columnId]: newWidth
      }));
    } catch (error) {
      logger.error('Error during column resize', { error });
      // Error during column resize
      setResizing(null);
      document.body.classList.remove('resizing');
    }
  }, [resizing]);

  const handleMouseUp = useCallback(() => {
    setResizing(null);
    // Remove resizing class from body
    document.body.classList.remove('resizing');
    // Remove active class from all resize handles
    document.querySelectorAll('.resize-handle.active').forEach(el => {
      el.classList.remove('active');
    });
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
    setStorageItem(STORAGE_KEY, columnWidths);
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
    removeStorageItem(STORAGE_KEY);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLElement>, columnId: string) => {
    e.preventDefault();
    // Don't stop propagation - let other handlers work
    
    // Get the th element
    const thElement = (e.target as HTMLElement).closest('th');
    if (!thElement) {
      return;
    }
    
    const rect = thElement.getBoundingClientRect();
    const startX = e.pageX;
    const startWidth = rect.width;
    
    // Add resizing class to body and resize handle
    document.body.classList.add('resizing');
    (e.target as HTMLElement).classList.add('active');
    
    startResize(columnId, startX, startWidth);
  }, [startResize]);

  return {
    columnWidths,
    startResize,
    handleMouseDown,
    getColumnWidth,
    resetColumnWidths,
    isResizing: !!resizing
  };
};