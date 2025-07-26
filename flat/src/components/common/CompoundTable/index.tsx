import React, { createContext, useContext } from 'react';
import { cn } from '../../../utils/cn';
import './CompoundTable.css';

// Table Context
interface TableContextValue {
  compact?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  selectable?: boolean;
}

const TableContext = createContext<TableContextValue>({});

const useTableContext = () => {
  return useContext(TableContext);
};

// Root Table Component
interface TableProps {
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  selectable?: boolean;
}

const TableRoot: React.FC<TableProps> = ({
  children,
  className = '',
  compact = false,
  striped = false,
  hoverable = true,
  selectable = false
}) => {
  return (
    <TableContext.Provider value={{ compact, striped, hoverable, selectable }}>
      <div className={cn('table-container', className)}>
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

const TableHeader: React.FC<TableHeaderProps> = ({ children, className = '' }) => (
  <thead className={cn('table-header', className)}>
    {children}
  </thead>
);

// Table Body Component
interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

const TableBody: React.FC<TableBodyProps> = ({ children, className = '' }) => {
  const { striped } = useTableContext();
  
  return (
    <tbody className={cn(
      'table-body',
      striped && 'table-body--striped',
      className
    )}>
      {children}
    </tbody>
  );
};

// Table Row Component
interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  selected?: boolean;
  onClick?: () => void;
}

const TableRow: React.FC<TableRowProps> = ({ 
  children, 
  className = '',
  selected = false,
  onClick
}) => {
  const { hoverable, selectable } = useTableContext();
  
  return (
    <tr 
      className={cn(
        'table-row',
        hoverable && 'table-row--hoverable',
        selectable && 'table-row--selectable',
        selected && 'table-row--selected',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

// Table Header Cell Component
interface TableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
  sortable?: boolean;
  sorted?: 'asc' | 'desc' | false;
  onSort?: () => void;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
}

const TableHeaderCell: React.FC<TableHeaderCellProps> = ({ 
  children, 
  className = '',
  sortable = false,
  sorted = false,
  onSort,
  align = 'left',
  width
}) => {
  const { compact } = useTableContext();
  
  return (
    <th 
      className={cn(
        'table-header-cell',
        compact && 'table-header-cell--compact',
        sortable && 'table-header-cell--sortable',
        `table-header-cell--${align}`,
        className
      )}
      onClick={sortable ? onSort : undefined}
      style={{ width }}
    >
      <div className="table-header-cell__content">
        {children}
        {sortable && sorted && (
          <span className="table-header-cell__sort">
            {sorted === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );
};

// Table Cell Component
interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  numeric?: boolean;
}

const TableCell: React.FC<TableCellProps> = ({ 
  children, 
  className = '',
  align = 'left',
  numeric = false
}) => {
  const { compact } = useTableContext();
  
  return (
    <td 
      className={cn(
        'table-cell',
        compact && 'table-cell--compact',
        numeric && 'table-cell--numeric',
        `table-cell--${align}`,
        className
      )}
    >
      {children}
    </td>
  );
};

// Table Empty State Component
interface TableEmptyProps {
  message?: string;
  icon?: React.ReactNode;
}

const TableEmpty: React.FC<TableEmptyProps> = ({ 
  message = 'No data available',
  icon
}) => (
  <tr>
    <td colSpan={100} className="table-empty">
      {icon && <div className="table-empty__icon">{icon}</div>}
      <p className="table-empty__message">{message}</p>
    </td>
  </tr>
);

// Table Loading State Component
interface TableLoadingProps {
  columns: number;
  rows?: number;
}

const TableLoading: React.FC<TableLoadingProps> = ({ columns, rows = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, index) => (
      <tr key={index}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <td key={colIndex} className="table-cell">
            <div className="table-loading-skeleton" />
          </td>
        ))}
      </tr>
    ))}
  </>
);

// Export compound components
export const Table = Object.assign(TableRoot, {
  Header: TableHeader,
  Body: TableBody,
  Row: TableRow,
  HeaderCell: TableHeaderCell,
  Cell: TableCell,
  Empty: TableEmpty,
  Loading: TableLoading
});

export default Table;