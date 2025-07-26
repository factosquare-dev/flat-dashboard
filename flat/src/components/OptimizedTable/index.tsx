/**
 * Optimized table component with memoization and virtual scrolling
 */

import React, { useMemo, useCallback } from 'react';
import VirtualList from '../VirtualList';

interface Column<T> {
  key: keyof T | string;
  title: string;
  width?: string | number;
  minWidth?: string | number;
  render?: (value: T[keyof T] | unknown, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  fixed?: 'left' | 'right';
  className?: string;
}

interface OptimizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowKey: keyof T | ((record: T, index: number) => string | number);
  height?: number;
  rowHeight?: number;
  loading?: boolean;
  className?: string;
  onRowClick?: (record: T, index: number) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortConfig?: {
    key: string;
    direction: 'asc' | 'desc';
  };
  stickyHeader?: boolean;
  striped?: boolean;
  hover?: boolean;
}

// Memoized table row component
const TableRow = React.memo(<T,>({
  record,
  index,
  columns,
  onRowClick,
  rowKey,
  striped,
  hover,
}: {
  record: T;
  index: number;
  columns: Column<T>[];
  onRowClick?: (record: T, index: number) => void;
  rowKey: keyof T | ((record: T, index: number) => string | number);
  striped?: boolean;
  hover?: boolean;
}) => {
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
      className={rowClassName}
      onClick={onRowClick ? handleClick : undefined}
      data-row-key={key}
    >
      {columns.map((column, colIndex) => {
        const value = typeof column.key === 'string' && column.key.includes('.') 
          ? column.key.split('.').reduce((obj: unknown, key) => (obj as Record<string, unknown>)?.[key], record as unknown)
          : record[column.key as keyof T];

        const cellClassName = `px-4 py-3 text-sm text-gray-900 ${column.className || ''}`;

        return (
          <td key={colIndex} className={cellClassName}>
            {column.render ? column.render(value, record, index) : value}
          </td>
        );
      })}
    </tr>
  );
});

TableRow.displayName = 'TableRow';

// Memoized table header component
const TableHeader = React.memo(<T,>({
  columns,
  onSort,
  sortConfig,
  stickyHeader,
}: {
  columns: Column<T>[];
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortConfig?: {
    key: string;
    direction: 'asc' | 'desc';
  };
  stickyHeader?: boolean;
}) => {
  const headerClassName = useMemo(() => {
    const classes = ['bg-gray-50', 'border-b', 'border-gray-200'];
    
    if (stickyHeader) {
      classes.push('sticky', 'top-0', 'z-10');
    }
    
    return classes.join(' ');
  }, [stickyHeader]);

  const handleSort = useCallback((columnKey: string) => {
    if (!onSort) return;
    
    const newDirection = 
      sortConfig?.key === columnKey && sortConfig.direction === 'asc' 
        ? 'desc' 
        : 'asc';
    
    onSort(columnKey, newDirection);
  }, [onSort, sortConfig]);

  const getThClassName = (isSortable: boolean) => {
    const classes = [
      'px-4', 'py-3', 'text-left', 'text-xs', 'font-medium', 
      'text-gray-500', 'uppercase', 'tracking-wider'
    ];
    
    if (isSortable) {
      classes.push('cursor-pointer', 'hover:bg-gray-100');
    }
    
    return classes.join(' ');
  };

  return (
    <thead className={headerClassName}>
      <tr>
        {columns.map((column, index) => {
          const isCurrentSort = sortConfig?.key === column.key;
          const isSortable = column.sortable && onSort;
          const thClassName = getThClassName(!!isSortable);

          return (
            <th
              key={index}
              className={thClassName}
              style={{
                width: column.width,
                minWidth: column.minWidth,
              }}
              onClick={isSortable ? () => handleSort(column.key as string) : undefined}
            >
              <div className="flex items-center space-x-1">
                <span>{column.title}</span>
                {isSortable && (
                  <span className="text-gray-400">
                    {isCurrentSort ? (
                      sortConfig?.direction === 'asc' ? '↑' : '↓'
                    ) : (
                      '↕'
                    )}
                  </span>
                )}
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
});

TableHeader.displayName = 'TableHeader';

function OptimizedTable<T>({
  data,
  columns,
  rowKey,
  height = 400,
  rowHeight = 60,
  loading = false,
  className = '',
  onRowClick,
  onSort,
  sortConfig,
  stickyHeader = true,
  striped = true,
  hover = true,
}: OptimizedTableProps<T>) {
  // Memoize row renderer for virtual list
  const renderRow = useCallback((record: T, index: number) => {
    return (
      <TableRow
        record={record}
        index={index}
        columns={columns}
        onRowClick={onRowClick}
        rowKey={rowKey}
        striped={striped}
        hover={hover}
      />
    );
  }, [columns, onRowClick, rowKey, striped, hover]);

  // Memoize key extractor for virtual list
  const keyExtractor = useCallback((record: T, index: number) => {
    return typeof rowKey === 'function' ? rowKey(record, index) : record[rowKey] as string | number;
  }, [rowKey]);

  const tableClassName = useMemo(() => {
    return `min-w-full divide-y divide-gray-200 ${className}`;
  }, [className]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  // For small datasets, render normally without virtualization
  if (data.length < 100) {
    return (
      <div className={`overflow-auto ${className}`} style={{ height }}>
        <table className={tableClassName}>
          <TableHeader
            columns={columns}
            onSort={onSort}
            sortConfig={sortConfig}
            stickyHeader={stickyHeader}
          />
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((record, index) => (
              <TableRow
                key={keyExtractor(record, index)}
                record={record}
                index={index}
                columns={columns}
                onRowClick={onRowClick}
                rowKey={rowKey}
                striped={striped}
                hover={hover}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // For large datasets, use virtual scrolling
  return (
    <div className={className}>
      <table className={tableClassName}>
        <TableHeader
          columns={columns}
          onSort={onSort}
          sortConfig={sortConfig}
          stickyHeader={stickyHeader}
        />
      </table>
      
      <VirtualList
        items={data}
        itemHeight={rowHeight}
        containerHeight={height - 40} // Account for header height
        renderItem={renderRow}
        keyExtractor={keyExtractor}
        className="border-t border-gray-200"
      />
    </div>
  );
}

export default React.memo(OptimizedTable) as <T>(
  props: OptimizedTableProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement;

export type { Column, OptimizedTableProps };