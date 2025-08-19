/**
 * Table body component with virtualization support
 */

import React from 'react';
import VirtualList from '@/VirtualList';
import { TableRow } from './TableRow';
import type { Column } from '@/components/types';

interface TableBodyProps<T> {
  data: T[];
  columns: Column<T>[];
  rowKey: keyof T | ((record: T, index: number) => string | number);
  height?: number;
  rowHeight?: number;
  onRowClick?: (record: T, index: number) => void;
  striped?: boolean;
  hover?: boolean;
  loading?: boolean;
}

export const TableBody = <T,>({
  data,
  columns,
  rowKey,
  height,
  rowHeight = 48,
  onRowClick,
  striped,
  hover,
  loading,
}: TableBodyProps<T>) => {
  const renderRow = (record: T, index: number) => (
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

  if (loading) {
    return (
      <tbody>
        <tr>
          <td colSpan={columns.length} className="text-center py-8">
            <div className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  if (data.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={columns.length} className="text-center py-8 text-gray-500">
            No data available
          </td>
        </tr>
      </tbody>
    );
  }

  // Use virtual scrolling if height is specified
  if (height) {
    return (
      <tbody>
        <tr>
          <td colSpan={columns.length} className="p-0">
            <VirtualList
              items={data}
              height={height}
              itemHeight={rowHeight}
              renderItem={renderRow}
              overscan={5}
            />
          </td>
        </tr>
      </tbody>
    );
  }

  // Regular rendering without virtualization
  return (
    <tbody>
      {data.map((record, index) => renderRow(record, index))}
    </tbody>
  );
};