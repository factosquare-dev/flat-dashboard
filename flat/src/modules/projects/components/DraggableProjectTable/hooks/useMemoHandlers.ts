import { useState, useRef, useEffect } from 'react';
import { useMemoColumns } from '@/shared/hooks/useMemoColumns';
import type { MemoHandlers } from '../types';

export const useMemoHandlers = () => {
  const { memoColumns, addMemoColumn, removeMemoColumn, updateMemoColumnName } = useMemoColumns();
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [editingMemoName, setEditingMemoName] = useState<string>('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editingMemoId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingMemoId]);

  const handleStartEditMemo = (columnId: string, columnLabel: string) => {
    setEditingMemoId(columnId);
    setEditingMemoName(columnLabel);
  };

  const handleSaveMemoName = (columnId: string) => {
    if (editingMemoName.trim()) {
      updateMemoColumnName(columnId, editingMemoName.trim());
    }
    setEditingMemoId(null);
    setEditingMemoName('');
  };

  const handleCancelEditMemo = () => {
    setEditingMemoId(null);
    setEditingMemoName('');
  };

  const handleAddMemoColumn = () => {
    addMemoColumn();
  };

  const handleRemoveMemoColumn = (columnId: string) => {
    removeMemoColumn(columnId);
  };

  return {
    memoColumns,
    editingMemoId,
    editingMemoName,
    editInputRef,
    handleStartEditMemo,
    handleSaveMemoName,
    handleCancelEditMemo,
    handleAddMemoColumn,
    handleRemoveMemoColumn,
    setEditingMemoName
  };
};