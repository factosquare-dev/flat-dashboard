import { useMemoContext } from '@/app/providers/MemoContext';
import { Column } from '@/shared/types/column';

export interface MemoColumn extends Column {
  isMemo: true;
  fieldId?: string; // Reference to CustomFieldDefinition.id
}

// Simple wrapper around the context
export const useMemoColumns = () => {
  return useMemoContext();
};