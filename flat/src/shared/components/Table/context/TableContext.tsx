/**
 * Table Context
 * Provides shared state for table compound components
 */

import React, { createContext, useContext, useState } from 'react';

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface TableContextValue {
  selectedRows: Set<string>;
  toggleRowSelection: (id: string) => void;
  toggleAllRows: () => void;
  sortConfig: SortConfig | null;
  setSortConfig: (config: SortConfig | null) => void;
  data: any[];
  selectable: boolean;
}

export const TableContext = createContext<TableContextValue | undefined>(undefined);

export const useTableContext = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('Table compound components must be used within Table.Root');
  }
  return context;
};

interface TableProviderProps {
  children: React.ReactNode;
  data: any[];
  selectable: boolean;
  defaultSort: SortConfig | null;
}

export const TableProvider: React.FC<TableProviderProps> = ({
  children,
  data,
  selectable,
  defaultSort
}) => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(defaultSort);

  const toggleRowSelection = (id: string) => {
    if (!selectable) return;
    
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleAllRows = () => {
    if (!selectable) return;
    
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map(item => item.id)));
    }
  };

  const value: TableContextValue = {
    selectedRows,
    toggleRowSelection,
    toggleAllRows,
    sortConfig,
    setSortConfig,
    data,
    selectable
  };

  return (
    <TableContext.Provider value={value}>
      {children}
    </TableContext.Provider>
  );
};