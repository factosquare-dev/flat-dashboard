import React, { useMemo } from 'react';
import type { Participant, Task } from '../../../../types/schedule';
import type { Project } from '../../../../types/project';
import type { Factory } from '../../../../types/factory';
import { useTaskContext } from '@/contexts/AppContext';
import { useTaskStore } from '@/stores/taskStore';
import { mockDataService } from '@/services/mockDataService';
import TableHeader from './TableHeader';
import TaskRow from './TaskRow';
import EmptyState from './EmptyState';

interface ScheduleTableViewProps {
  projects?: Factory[];  // Should be Factory[] not Participant[]
  tasks?: Task[];
  projectId?: string;
  onTaskClick?: (task: Task) => void;
}

const ScheduleTableView: React.FC<ScheduleTableViewProps> = React.memo(({
  projects: propsProjects,
  tasks: propsTasks,
  projectId,
  onTaskClick,
}) => {
  // Use context data if props are not provided
  const { tasks: contextTasks, participants, onTaskDelete, onFactoryDelete } = useTaskContext();
  
  // Use taskStore to get unified task data
  const { getTasksForProject } = useTaskStore();
  const storeTasks = projectId ? getTasksForProject(projectId) : [];
  
  // Get tasks from MockDB if not available elsewhere
  const mockDbTasks = useMemo(() => {
    try {
      if (projectId) {
        return mockDataService.getTasksByProjectId(projectId);
      }
      return mockDataService.getAllTasks();
    } catch (error) {
      // Silently fail
      return [];
    }
  }, [projectId]);
  
  // Priority: props > store > mockDB > context
  const tasks = propsTasks || 
                (storeTasks.length > 0 ? storeTasks : 
                (mockDbTasks.length > 0 ? mockDbTasks : contextTasks));
  const projects = propsProjects || participants;

  // Sort all tasks by start date
  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    ),
    [tasks]
  );

  // Get actual Project data from MockDB for each task
  const allProjects = useMemo(() => mockDataService.getAllProjects(), []);
  const projectMap = useMemo(
    () => new Map(allProjects.map(p => [p.id, p])),
    [allProjects]
  );

  return (
    <div className="h-full overflow-auto bg-white">
      <table 
        className="w-full" 
        role="table"
        aria-label="작업 스케줄 테이블"
      >
        <TableHeader />
        <tbody role="rowgroup">
          {sortedTasks.map((task) => {
            // Get actual Project data using task.projectId (new convenience field)
            const project = projectMap.get(task.projectId || task.scheduleId);
            
            return (
              <TaskRow
                key={task.id}
                task={task}
                project={project}
                onTaskClick={onTaskClick}
                onTaskDelete={onTaskDelete}
                onFactoryDelete={onFactoryDelete}
              />
            );
          })}
          {sortedTasks.length === 0 && <EmptyState />}
        </tbody>
      </table>
    </div>
  );
});

ScheduleTableView.displayName = 'ScheduleTableView';

export default ScheduleTableView;