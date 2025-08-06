/**
 * Optimized table component with memoization and virtual scrolling
 */

import React from 'react';
import { TableHeader } from './components/TableHeader';
import { TableBody } from './components/TableBody';
import type { OptimizedTableProps } from './types';

const OptimizedTable = <T extends Record<string, any>>({
  data,
  columns,
  rowKey,
  height,
  rowHeight = 48,
  loading = false,
  className = '',
  onRowClick,
  onSort,
  sortConfig,
  stickyHeader = false,
  striped = false,
  hover = true,
}: OptimizedTableProps<T>) => {
  const tableClassName = [
    'optimized-table',
    'w-full',
    'bg-white',
    'shadow-sm',
    'rounded-lg',
    'overflow-hidden',
    className,
  ].join(' ');

  const containerClassName = height ? 'relative overflow-hidden' : '';

  return (
    <div className={tableClassName}>
      <div className={containerClassName}>
        <table className="w-full">
          <TableHeader
            columns={columns}
            onSort={onSort}
            sortConfig={sortConfig}
            stickyHeader={stickyHeader}
          />
          <TableBody
            data={data}
            columns={columns}
            rowKey={rowKey}
            height={height}
            rowHeight={rowHeight}
            onRowClick={onRowClick}
            striped={striped}
            hover={hover}
            loading={loading}
          />
        </table>
      </div>
    </div>
  );
};

export default OptimizedTable;

// Export types
export type { Column, OptimizedTableProps } from './types';