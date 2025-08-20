/**
 * Comprehensive debugging for Schedule component
 * Shows all relevant data in table format
 */

import type { Task, Participant } from '@/shared/types/schedule';
import { formatDateKey } from './scheduleDateCalculation';
import { parseScheduleDate } from './scheduleDateParsing';

export function comprehensiveScheduleDebug(
  tasks: Task[],
  days: Date[],
  participants: Participant[],
  cellWidth: number,
  projectStartDate?: string,
  projectEndDate?: string
): void {
  // Debug function - disabled in production
  return;
}

function detectDateFormat(dateStr: string): string {
  if (!dateStr) return 'EMPTY';
  if (dateStr.includes('. ')) return 'Korean (YYYY. M. D.)';
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return 'ISO (YYYY-MM-DD)';
  if (dateStr.includes('T')) return 'ISO with time';
  if (dateStr.includes('/')) return 'Slash format';
  return 'Unknown';
}