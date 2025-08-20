/**
 * Memoized table row component
 */

import React, { useMemo, useCallback } from 'react';
import type { TableRowProps } from '@/components/types';

export const TableRow = React.memo(<T,>({
  record,
  index,
  columns,
  onRowClick,
  rowKey,
  striped,
  hover,
}: TableRowProps<T>) => {
  const handleClick = useCallback(() => {
    onRowClick?.(record, index);
  }, [onRowClick, record, index]);

  const key = useMemo(() => {
    return typeof rowKey === 'function' ? rowKey(record, index) : record[rowKey];
  }, [rowKey, record, index]);

  const rowClassName = useMemo(() => {
    const classes = ['table-row', 'border-b', 'border-gray-200'];
    
    if (striped && index % 2 === 1) {
      classes.push('bg-gray-50');
    }
    
    if (hover) {
      classes.push('hover:bg-gray-100', 'cursor-pointer');
    }
    
    if (onRowClick) {
      classes.push('cursor-pointer');
    }
    
    return classes.join(' ');
  }, [striped, hover, onRowClick, index]);

  return (
    <tr
      key={String(key)}
      className={rowClassName}
      onClick={handleClick}
    >
      {columns.map((column) => {
        const value = column.key in (record as any) ? (record as any)[column.key] : undefined;
        const cellContent = column.render ? column.render(value, record, index) : value;
        
        const cellClassName = ['px-4', 'py-2', 'text-sm', column.className].filter(Boolean).join(' ');
        
        return (
          <td
            key={String(column.key)}
            className={cellClassName}
            style={{
              width: column.width,
              minWidth: column.minWidth,
            }}
          >
            {cellContent}
          </td>
        );
      })}
    </tr>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.record === nextProps.record &&
    prevProps.index === nextProps.index &&
    prevProps.columns === nextProps.columns &&
    prevProps.onRowClick === nextProps.onRowClick &&
    prevProps.rowKey === nextProps.rowKey &&
    prevProps.striped === nextProps.striped &&
    prevProps.hover === nextProps.hover
  );
});

TableRow.displayName = 'TableRow';