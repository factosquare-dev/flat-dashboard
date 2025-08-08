import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MockDatabaseImpl } from '@/mocks/database/MockDatabase';
import { CustomFieldEntity } from '@/types/customField';
import type { MemoColumn } from '@/hooks/useMemoColumns';

const MAX_MEMO_COLUMNS = 10;

interface MemoContextType {
  memoColumns: MemoColumn[];
  addMemoColumn: () => void;
  removeMemoColumn: (columnId: string) => void;
  updateMemoColumnName: (columnId: string, newName: string) => void;
  resetMemoColumns: () => void;
  getMemoValue: (projectId: string, memoId: string) => string;
  setMemoValue: (projectId: string, memoId: string, value: string) => void;
}

const MemoContext = createContext<MemoContextType | undefined>(undefined);

export const useMemoContext = () => {
  const context = useContext(MemoContext);
  if (!context) {
    throw new Error('useMemoContext must be used within a MemoProvider');
  }
  return context;
};

interface MemoProviderProps {
  children: ReactNode;
}

export const MemoProvider: React.FC<MemoProviderProps> = ({ children }) => {
  const db = MockDatabaseImpl.getInstance();
  const customFieldManager = db.getCustomFieldManager();

  const [memoColumns, setMemoColumns] = useState<MemoColumn[]>(() => {
    // Load memo fields from MockDB
    const memoFields = customFieldManager.getMemoFields();
    
    if (memoFields.length > 0) {
      return memoFields.map(field => ({
        id: field.id,
        label: field.name,
        sortable: false,
        width: field.displayOptions?.width || '150px',
        isMemo: true as const,
        fieldId: field.id
      }));
    }
    
    // Create default memo fields if none exist
    const defaultMemos: MemoColumn[] = [];
    for (let i = 1; i <= 3; i++) {
      const field = customFieldManager.createMemoField(`메모 ${i}`);
      defaultMemos.push({
        id: field.id,
        label: field.name,
        sortable: false,
        width: '150px',
        isMemo: true as const,
        fieldId: field.id
      });
    }
    
    return defaultMemos;
  });

  // Sync with database when memoColumns change
  useEffect(() => {
    // Save to storage through MockDB
    const storageManager = (db as any).storageManager;
    if (storageManager) {
      storageManager.saveToStorage(db.getDatabase());
    }
  }, [memoColumns, db]);

  const addMemoColumn = () => {
    console.log('[MemoContext] addMemoColumn called, current columns:', memoColumns.length);
    
    if (memoColumns.length >= MAX_MEMO_COLUMNS) {
      alert(`최대 ${MAX_MEMO_COLUMNS}개의 메모 컬럼만 추가할 수 있습니다.`);
      return;
    }

    // Create new field in database
    const field = customFieldManager.createMemoField(`메모 ${memoColumns.length + 1}`);
    console.log('[MemoContext] Created new field:', field.id, field.name);
    
    const newColumn: MemoColumn = {
      id: field.id,
      label: field.name,
      sortable: false,
      width: '150px',
      isMemo: true as const,
      fieldId: field.id
    };

    setMemoColumns(prev => {
      console.log('[MemoContext] Adding column to state, new total:', prev.length + 1);
      return [...prev, newColumn];
    });
  };

  const removeMemoColumn = (columnId: string) => {
    console.log('[MemoContext] removeMemoColumn called for:', columnId);
    
    if (memoColumns.length <= 1) {
      alert('최소 1개의 메모 컬럼은 유지해야 합니다.');
      return;
    }

    // Find the field to delete
    const column = memoColumns.find(col => col.id === columnId);
    if (!column?.fieldId) {
      console.error('[MemoContext] Column not found or no fieldId:', columnId);
      return;
    }

    // Delete from database
    const deleted = customFieldManager.deleteFieldDefinition(column.fieldId);
    if (!deleted) {
      console.error('[MemoContext] Failed to delete field from DB:', column.fieldId);
      alert('메모 컬럼을 삭제할 수 없습니다.');
      return;
    }

    console.log('[MemoContext] Field deleted from DB, removing from state');
    // Remove from state
    setMemoColumns(prev => prev.filter(col => col.id !== columnId));
  };

  const updateMemoColumnName = (columnId: string, newName: string) => {
    console.log('[MemoContext] updateMemoColumnName called:', columnId, newName);
    
    // Find the field to update
    const column = memoColumns.find(col => col.id === columnId);
    if (!column?.fieldId) {
      console.error('[MemoContext] Column not found for rename:', columnId);
      return;
    }

    // Update in database
    const updated = customFieldManager.updateFieldDefinition(column.fieldId, { name: newName });
    if (!updated) {
      console.error('[MemoContext] Failed to update field name in DB');
      alert('메모 이름을 변경할 수 없습니다.');
      return;
    }

    console.log('[MemoContext] Field name updated in DB, updating state');
    // Update state
    setMemoColumns(prev => prev.map(col =>
      col.id === columnId ? { ...col, label: newName } : col
    ));
  };

  const resetMemoColumns = () => {
    // Delete all existing memo fields
    const currentFields = customFieldManager.getMemoFields();
    currentFields.forEach(field => {
      customFieldManager.deleteFieldDefinition(field.id);
    });

    // Create default fields
    const defaultMemos: MemoColumn[] = [];
    for (let i = 1; i <= 3; i++) {
      const field = customFieldManager.createMemoField(`메모 ${i}`);
      defaultMemos.push({
        id: field.id,
        label: field.name,
        sortable: false,
        width: '150px',
        isMemo: true as const,
        fieldId: field.id
      });
    }
    
    setMemoColumns(defaultMemos);
  };

  // Function to get memo value for a project
  const getMemoValue = (projectId: string, memoId: string): string => {
    const column = memoColumns.find(col => col.id === memoId);
    if (!column?.fieldId) {
      console.log('[MemoContext] getMemoValue: Column not found for memoId:', memoId);
      return '';
    }

    const value = customFieldManager.getFieldValue(projectId, column.fieldId);
    return value?.value || '';
  };

  // Function to set memo value for a project
  const setMemoValue = (projectId: string, memoId: string, value: string) => {
    console.log('[MemoContext] setMemoValue:', { projectId, memoId, value });
    
    const column = memoColumns.find(col => col.id === memoId);
    if (!column?.fieldId) {
      console.error('[MemoContext] Column not found for memoId:', memoId);
      return;
    }

    customFieldManager.setFieldValue(
      projectId,
      CustomFieldEntity.PROJECT,
      column.fieldId,
      value
    );

    console.log('[MemoContext] Memo value saved to DB');
    // Save to storage
    const storageManager = (db as any).storageManager;
    if (storageManager) {
      storageManager.saveToStorage(db.getDatabase());
    }
  };

  const value: MemoContextType = {
    memoColumns,
    addMemoColumn,
    removeMemoColumn,
    updateMemoColumnName,
    resetMemoColumns,
    getMemoValue,
    setMemoValue
  };

  return (
    <MemoContext.Provider value={value}>
      {children}
    </MemoContext.Provider>
  );
};