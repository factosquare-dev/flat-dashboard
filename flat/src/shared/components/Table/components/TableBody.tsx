/**
 * Table Body Components
 */

import React from 'react';
import { cn } from '@/shared/utils/cn';
import { useTableContext } from '@/components/common/context/TableContext';

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  const { data } = useTableContext();
  
  return (
    <tbody className={cn('bg-white divide-y divide-gray-200', className)}>
      {children}
    </tbody>
  );
};

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export const TableCell: React.FC<TableCellProps> = ({ 
  children, 
  className,
  align = 'left'
}) => {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align];

  return (
    <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900', alignClass, className)}>
      {children}
    </td>
  );
};

interface TableSelectProps {
  id: string;
  className?: string;
}

export const TableSelect: React.FC<TableSelectProps> = ({ id, className }) => {
  const { selectedRows, toggleRowSelection, toggleAllRows, data, selectable } = useTableContext();
  
  if (!selectable) return null;
  
  const isHeader = id === 'all';
  const isSelected = isHeader 
    ? selectedRows.size === data.length && data.length > 0
    : selectedRows.has(id);
  const isIndeterminate = isHeader && selectedRows.size > 0 && selectedRows.size < data.length;
  
  const handleChange = () => {
    if (isHeader) {
      toggleAllRows();
    } else {
      toggleRowSelection(id);
    }
  };
  
  return (
    <td className={cn('px-6 py-4 whitespace-nowrap', className)}>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={handleChange}
        ref={input => {
          if (input) {
            input.indeterminate = isIndeterminate;
          }
        }}
        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
      />
    </td>
  );
};

interface TableEmptyProps {
  children?: React.ReactNode;
  className?: string;
}

export const TableEmpty: React.FC<TableEmptyProps> = ({ children, className }) => {
  return (
    <tr>
      <td colSpan={100} className={cn('px-6 py-12 text-center text-sm text-gray-500', className)}>
        {children || 'No data available'}
      </td>
    </tr>
  );
};