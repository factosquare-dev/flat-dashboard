/**
 * Table Root Component
 */

import React, { useMemo } from 'react';
import { cn } from '@/utils/cn';
import { TableProvider, SortConfig } from '@/components/common/context/TableContext';

interface TableRootProps {
  children: React.ReactNode;
  data: any[];
  className?: string;
  selectable?: boolean;
  defaultSort?: SortConfig;
}

export const TableRoot: React.FC<TableRootProps> = ({ 
  children, 
  data,
  className,
  selectable = false,
  defaultSort = null
}) => {
  // Sort data if sortConfig is provided
  const sortedData = useMemo(() => {
    if (!defaultSort) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[defaultSort.key];
      const bValue = b[defaultSort.key];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (aValue < bValue) {
        return defaultSort.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return defaultSort.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, defaultSort]);

  return (
    <TableProvider data={sortedData} selectable={selectable} defaultSort={defaultSort}>
      <div className={cn('w-full overflow-x-auto', className)}>
        <table className="w-full border-collapse bg-white">
          {children}
        </table>
      </div>
    </TableProvider>
  );
};