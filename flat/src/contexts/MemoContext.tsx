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
    if (memoColumns.length >= MAX_MEMO_COLUMNS) {
      alert(`최대 ${MAX_MEMO_COLUMNS}개의 메모 컬럼만 추가할 수 있습니다.`);
      return;
    }

    // Create new field in database
    const field = customFieldManager.createMemoField(`메모 ${memoColumns.length + 1}`);
    
    const newColumn: MemoColumn = {
      id: field.id,
      label: field.name,
      sortable: false,
      width: '150px',
      isMemo: true as const,
      fieldId: field.id
    };

    setMemoColumns(prev => [...prev, newColumn]);
  };

  const removeMemoColumn = (columnId: string) => {
    if (memoColumns.length <= 1) {
      alert('최소 1개의 메모 컬럼은 유지해야 합니다.');
      return;
    }

    // Find the field to delete
    const column = memoColumns.find(col => col.id === columnId);
    if (!column?.fieldId) return;

    // Delete from database
    const deleted = customFieldManager.deleteFieldDefinition(column.fieldId);
    if (!deleted) {
      alert('메모 컬럼을 삭제할 수 없습니다.');
      return;
    }

    // Remove from state
    setMemoColumns(prev => prev.filter(col => col.id !== columnId));
  };

  const updateMemoColumnName = (columnId: string, newName: string) => {
    // Find the field to update
    const column = memoColumns.find(col => col.id === columnId);
    if (!column?.fieldId) return;

    // Update in database
    const updated = customFieldManager.updateFieldDefinition(column.fieldId, { name: newName });
    if (!updated) {
      alert('메모 이름을 변경할 수 없습니다.');
      return;
    }

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
    if (!column?.fieldId) return '';

    const value = customFieldManager.getFieldValue(projectId, column.fieldId);
    return value?.value || '';
  };

  // Function to set memo value for a project
  const setMemoValue = (projectId: string, memoId: string, value: string) => {
    const column = memoColumns.find(col => col.id === memoId);
    if (!column?.fieldId) return;

    customFieldManager.setFieldValue(
      projectId,
      CustomFieldEntity.PROJECT,
      column.fieldId,
      value
    );

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