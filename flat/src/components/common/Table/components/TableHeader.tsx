/**
 * Table Header Components
 */

import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTableContext } from '@/components/common/context/TableContext';

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return (
    <thead className={cn('bg-gray-50 border-b border-gray-200', className)}>
      {children}
    </thead>
  );
};

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
}

export const TableRow: React.FC<TableRowProps> = ({ children, className }) => {
  return (
    <tr className={cn('border-b border-gray-100 hover:bg-gray-50', className)}>
      {children}
    </tr>
  );
};

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
  sortKey?: string;
  align?: 'left' | 'center' | 'right';
}

export const TableHead: React.FC<TableHeadProps> = ({ 
  children, 
  className,
  sortKey,
  align = 'left'
}) => {
  const { sortConfig, setSortConfig, data } = useTableContext();
  
  const handleSort = () => {
    if (!sortKey) return;
    
    if (sortConfig?.key === sortKey) {
      setSortConfig({
        key: sortKey,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setSortConfig({
        key: sortKey,
        direction: 'asc'
      });
    }
  };
  
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align];

  return (
    <th 
      className={cn(
        'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
        alignClass,
        sortKey && 'cursor-pointer select-none hover:text-gray-700',
        className
      )}
      onClick={handleSort}
    >
      <div className={cn('flex items-center gap-1', align === 'center' && 'justify-center', align === 'right' && 'justify-end')}>
        {children}
        {sortKey && (
          <span className="inline-flex flex-col">
            <ChevronUp 
              className={cn(
                'h-3 w-3 -mb-1',
                sortConfig?.key === sortKey && sortConfig.direction === 'asc'
                  ? 'text-gray-700'
                  : 'text-gray-400'
              )}
            />
            <ChevronDown 
              className={cn(
                'h-3 w-3',
                sortConfig?.key === sortKey && sortConfig.direction === 'desc'
                  ? 'text-gray-700'
                  : 'text-gray-400'
              )}
            />
          </span>
        )}
      </div>
    </th>
  );
};