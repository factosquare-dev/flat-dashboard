/**
 * Comprehensive debugging for Schedule component
 * Shows all relevant data in table format
 */

import type { Task, Participant } from '../types/schedule';
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
  console.log('📊 TASK RENDERING DEBUG:');
  
  const renderingData = tasks.map((task, i) => {
    // Calculate grid positions
    const startCell = Math.floor(task.x / cellWidth);
    const endCell = Math.floor((task.x + task.width - 1) / cellWidth);
    
    const gridStartDate = startCell >= 0 && startCell < days.length 
      ? formatDateKey(days[startCell]) 
      : 'OUT_OF_RANGE';
    
    return {
      'No': i + 1,
      'Name': task.title || task.name || task.taskType || 'Unnamed',
      'ID': task.id,
      'Data Date': `${task.startDate} ~ ${task.endDate}`,
      'X Position': task.x,
      'Width': task.width,
      'Cell Index': startCell,
      'Grid Date': gridStartDate,
      'Match': task.startDate === gridStartDate ? '✅' : `❌ (${Math.floor((new Date(gridStartDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 60 * 60 * 24))} days off)`
    };
  });
  
  console.table(renderingData);
  
  // Also show first 10 grid cells for reference
  console.log('\n📅 GRID REFERENCE (first 10 cells):');
  const gridRef = days.slice(0, 10).map((day, i) => ({
    'Cell': i,
    'X': i * cellWidth,
    'Date': formatDateKey(day)
  }));
  console.table(gridRef);
}

function detectDateFormat(dateStr: string): string {
  if (!dateStr) return 'EMPTY';
  if (dateStr.includes('. ')) return 'Korean (YYYY. M. D.)';
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return 'ISO (YYYY-MM-DD)';
  if (dateStr.includes('T')) return 'ISO with time';
  if (dateStr.includes('/')) return 'Slash format';
  return 'Unknown';
}