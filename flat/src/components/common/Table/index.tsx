/**
 * Table Compound Components
 * 
 * A flexible table system using the compound components pattern
 * Supports sorting, selection, and responsive design
 */

import React, { createContext, useContext, useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../../../utils/cn';
import './Table.css';

// Table Context for sharing state
interface TableContextValue {
  selectedRows: Set<string>;
  toggleRowSelection: (id: string) => void;
  toggleAllRows: () => void;
  sortConfig: SortConfig | null;
  setSortConfig: (config: SortConfig | null) => void;
  data: any[];
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

const TableContext = createContext<TableContextValue | undefined>(undefined);

const useTableContext = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('Table compound components must be used within Table.Root');
  }
  return context;
};

// Root Table Component
interface TableRootProps {
  children: React.ReactNode;
  data: any[];
  className?: string;
  selectable?: boolean;
  defaultSort?: SortConfig;
}

const TableRoot: React.FC<TableRootProps> = ({ 
  children, 
  data,
  className,
  selectable = false,
  defaultSort = null
}) => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(defaultSort);

  const toggleRowSelection = (id: string) => {
    if (!selectable) return;
    
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleAllRows = () => {
    if (!selectable) return;
    
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map(item => item.id)));
    }
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  return (
    <TableContext.Provider value={{
      selectedRows,
      toggleRowSelection,
      toggleAllRows,
      sortConfig,
      setSortConfig,
      data: sortedData
    }}>
      <div className={cn('table-wrapper', className)}>
        <table className="table">
          {children}
        </table>
      </div>
    </TableContext.Provider>
  );
};

// Table Header Component
interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return (
    <thead className={cn('table-header', className)}>
      {children}
    </thead>
  );
};

// Table Row Component
interface TableRowProps {
  children: React.ReactNode;
  className?: string;
}

const TableRow: React.FC<TableRowProps> = ({ children, className }) => {
  return (
    <tr className={cn('table-row', className)}>
      {children}
    </tr>
  );
};

// Table Head Cell Component
interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
  sortKey?: string;
  align?: 'left' | 'center' | 'right';
}

const TableHead: React.FC<TableHeadProps> = ({ 
  children, 
  className,
  sortKey,
  align = 'left'
}) => {
  const { sortConfig, setSortConfig } = useTableContext();
  
  const handleSort = () => {
    if (!sortKey) return;
    
    setSortConfig(
      sortConfig?.key === sortKey && sortConfig.direction === 'asc'
        ? { key: sortKey, direction: 'desc' }
        : { key: sortKey, direction: 'asc' }
    );
  };

  const isSorted = sortConfig?.key === sortKey;
  const isAsc = isSorted && sortConfig.direction === 'asc';

  return (
    <th 
      className={cn(
        'table-head',
        `table-head--${align}`,
        sortKey && 'table-head--sortable',
        className
      )}
      onClick={sortKey ? handleSort : undefined}
    >
      <div className="table-head__content">
        {children}
        {sortKey && (
          <span className="table-head__sort-icon">
            {isSorted ? (
              isAsc ? <ChevronUp size={16} /> : <ChevronDown size={16} />
            ) : (
              <ChevronUp size={16} className="table-head__sort-icon--inactive" />
            )}
          </span>
        )}
      </div>
    </th>
  );
};

// Table Body Component
interface TableBodyProps {
  children: React.ReactNode | ((data: any[]) => React.ReactNode);
  className?: string;
}

const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  const { data } = useTableContext();
  
  return (
    <tbody className={cn('table-body', className)}>
      {typeof children === 'function' ? children(data) : children}
    </tbody>
  );
};

// Table Cell Component
interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

const TableCell: React.FC<TableCellProps> = ({ 
  children, 
  className,
  align = 'left'
}) => {
  return (
    <td className={cn('table-cell', `table-cell--${align}`, className)}>
      {children}
    </td>
  );
};

// Selection Checkbox Component
interface TableSelectProps {
  id?: string;
  className?: string;
}

const TableSelect: React.FC<TableSelectProps> = ({ id, className }) => {
  const { selectedRows, toggleRowSelection, toggleAllRows, data } = useTableContext();
  
  if (id) {
    // Row checkbox
    return (
      <TableCell className={cn('table-cell--select', className)}>
        <input
          type="checkbox"
          checked={selectedRows.has(id)}
          onChange={() => toggleRowSelection(id)}
          className="table-checkbox"
        />
      </TableCell>
    );
  } else {
    // Header checkbox
    const isAllSelected = selectedRows.size === data.length && data.length > 0;
    const isIndeterminate = selectedRows.size > 0 && selectedRows.size < data.length;
    
    return (
      <TableHead className={cn('table-head--select', className)}>
        <input
          type="checkbox"
          checked={isAllSelected}
          ref={input => {
            if (input) {
              input.indeterminate = isIndeterminate;
            }
          }}
          onChange={toggleAllRows}
          className="table-checkbox"
        />
      </TableHead>
    );
  }
};

// Empty State Component
interface TableEmptyProps {
  children: React.ReactNode;
  className?: string;
}

const TableEmpty: React.FC<TableEmptyProps> = ({ children, className }) => {
  return (
    <TableRow>
      <TableCell 
        className={cn('table-empty', className)} 
        align="center"
      >
        {children}
      </TableCell>
    </TableRow>
  );
};

// Export compound components
export const Table = {
  Root: TableRoot,
  Header: TableHeader,
  Row: TableRow,
  Head: TableHead,
  Body: TableBody,
  Cell: TableCell,
  Select: TableSelect,
  Empty: TableEmpty,
};

// Usage Example:
// <Table.Root data={projects} selectable>
//   <Table.Header>
//     <Table.Row>
//       <Table.Select />
//       <Table.Head sortKey="name">Project Name</Table.Head>
//       <Table.Head sortKey="status">Status</Table.Head>
//       <Table.Head sortKey="date" align="right">Date</Table.Head>
//     </Table.Row>
//   </Table.Header>
//   <Table.Body>
//     {(data) => data.map(project => (
//       <Table.Row key={project.id}>
//         <Table.Select id={project.id} />
//         <Table.Cell>{project.name}</Table.Cell>
//         <Table.Cell>{project.status}</Table.Cell>
//         <Table.Cell align="right">{project.date}</Table.Cell>
//       </Table.Row>
//     ))}
//   </Table.Body>
// </Table.Root>