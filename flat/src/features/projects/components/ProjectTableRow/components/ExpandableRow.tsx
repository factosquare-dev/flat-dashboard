/**
 * Expandable row component for showing tasks
 */

import React from 'react';
import TaskList from '../../TaskList';
import type { Task } from '@/types/schedule';
import type { Column } from '@/hooks/useColumnOrder';

interface ExpandableRowProps {
  isExpanded: boolean;
  tasks: Task[];
  columns: Column[];
  onTaskToggle: (taskId: string) => void;
}

export const ExpandableRow: React.FC<ExpandableRowProps> = ({
  isExpanded,
  tasks,
  columns,
  onTaskToggle
}) => {
  if (!isExpanded) return null;

  return (
    <tr>
      <td></td>
      <td colSpan={columns.filter(c => c.visible).length + 1} className="px-4 py-2 bg-gray-50">
        <TaskList
          tasks={tasks}
          onToggle={onTaskToggle}
        />
      </td>
    </tr>
  );
};