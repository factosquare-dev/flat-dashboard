/**
 * Table header component with sorting
 */

import React, { useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { TableHeaderProps } from '../types';

export const TableHeader = <T,>({
  columns,
  onSort,
  sortConfig,
  stickyHeader,
}: TableHeaderProps<T>) => {
  const handleSort = useCallback((key: string) => {
    if (!onSort) return;
    
    const direction = sortConfig?.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    onSort(key, direction);
  }, [onSort, sortConfig]);

  const headerClassName = ['bg-gray-50', 'border-b', 'border-gray-200'];
  if (stickyHeader) {
    headerClassName.push('sticky', 'top-0', 'z-10');
  }

  return (
    <thead className={headerClassName.join(' ')}>
      <tr>
        {columns.map((column) => {
          const isActive = sortConfig?.key === String(column.key);
          const isAsc = isActive && sortConfig.direction === 'asc';
          const isDesc = isActive && sortConfig.direction === 'desc';
          
          const headerCellClassName = [
            'px-4',
            'py-3',
            'text-left',
            'text-xs',
            'font-medium',
            'text-gray-500',
            'uppercase',
            'tracking-wider',
            column.sortable && 'cursor-pointer hover:text-gray-700',
            column.className,
          ].filter(Boolean).join(' ');

          return (
            <th
              key={String(column.key)}
              className={headerCellClassName}
              style={{
                width: column.width,
                minWidth: column.minWidth,
              }}
              onClick={column.sortable ? () => handleSort(String(column.key)) : undefined}
            >
              <div className="flex items-center space-x-1">
                <span>{column.title}</span>
                {column.sortable && (
                  <div className="flex flex-col">
                    <ChevronUp
                      className={`w-3 h-3 ${isAsc ? 'text-gray-700' : 'text-gray-400'}`}
                    />
                    <ChevronDown
                      className={`w-3 h-3 -mt-1 ${isDesc ? 'text-gray-700' : 'text-gray-400'}`}
                    />
                  </div>
                )}
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
};