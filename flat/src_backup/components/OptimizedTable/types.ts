/**
 * OptimizedTable types
 */

export interface Column<T> {
  key: keyof T | string;
  title: string;
  width?: string | number;
  minWidth?: string | number;
  render?: (value: T[keyof T] | unknown, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  fixed?: 'left' | 'right';
  className?: string;
}

export interface OptimizedTableProps<T> {
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

export interface TableRowProps<T> {
  record: T;
  index: number;
  columns: Column<T>[];
  onRowClick?: (record: T, index: number) => void;
  rowKey: keyof T | ((record: T, index: number) => string | number);
  striped?: boolean;
  hover?: boolean;
}

export interface TableHeaderProps<T> {
  columns: Column<T>[];
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortConfig?: {
    key: string;
    direction: 'asc' | 'desc';
  };
  stickyHeader?: boolean;
}