import { useMemoContext } from '@/contexts/MemoContext';
import { Column } from './useColumnOrder';

export interface MemoColumn extends Column {
  isMemo: true;
  fieldId?: string; // Reference to CustomFieldDefinition.id
}

// Simple wrapper around the context
export const useMemoColumns = () => {
  return useMemoContext();
};