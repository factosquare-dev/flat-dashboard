/**
 * Expandable row component for showing tasks
 */

import React from 'react';
import TaskList from '../../TaskList';
import type { Task } from '@/shared/types/schedule';
import type { Column } from '@/shared/hooks/useColumnOrder';

interface ExpandableRowProps {
  isExpanded: boolean;
  projectId: string;
  tasks: Task[];
  columns: Column[];
  onTaskToggle: (taskId: string) => void;
}

export const ExpandableRow: React.FC<ExpandableRowProps> = ({
  isExpanded,
  projectId,
  tasks,
  columns,
  onTaskToggle
}) => {
  if (!isExpanded) return null;

  // Calculate proper colspan: checkbox column + visible columns + options column
  const visibleColumnCount = columns.filter(c => c.visible !== false).length;
  const totalColspan = visibleColumnCount + 2; // +1 for checkbox, +1 for options column
  
  return (
    <tr>
      <td colSpan={totalColspan} className="px-4 py-2 bg-gray-50">
        <TaskList
          projectId={projectId}
          tasks={tasks}
          onTaskToggle={onTaskToggle}
        />
      </td>
    </tr>
  );
};