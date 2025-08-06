/**
 * Table Compound Components
 * 
 * A flexible table system using the compound components pattern
 * Supports sorting, selection, and responsive design
 */

import {
  TableRoot,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableSelect,
  TableEmpty
} from './components';

import './Table.css';

// Export compound components as a single object
export const Table = {
  Root: TableRoot,
  Header: TableHeader,
  Row: TableRow,
  Head: TableHead,
  Body: TableBody,
  Cell: TableCell,
  Select: TableSelect,
  Empty: TableEmpty
};

// Also export individual components for flexibility
export {
  TableRoot,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableSelect,
  TableEmpty
};

// Export context utilities
export { useTableContext } from './context/TableContext';
export type { TableContextValue, SortConfig } from './context/TableContext';