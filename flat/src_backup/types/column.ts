/**
 * Column related types for table components
 */

export interface Column {
  id: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  isMemo?: boolean;
  visible?: boolean;
}

// Type guard for Column validation with runtime type checking
export const isValidColumn = (obj: any): obj is Column => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.label === 'string' &&
    (obj.sortable === undefined || typeof obj.sortable === 'boolean') &&
    (obj.align === undefined || ['left', 'center', 'right'].includes(obj.align)) &&
    (obj.width === undefined || typeof obj.width === 'string') &&
    (obj.isMemo === undefined || typeof obj.isMemo === 'boolean') &&
    (obj.visible === undefined || typeof obj.visible === 'boolean')
  );
};

// Type guard for Column array validation
export const isValidColumnArray = (arr: any): arr is Column[] => {
  return Array.isArray(arr) && arr.every(isValidColumn);
};