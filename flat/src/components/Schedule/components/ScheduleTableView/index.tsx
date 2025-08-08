import React, { useMemo, useEffect, useState } from 'react';
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
  onAddFactory?: () => void;
}

const ScheduleTableView: React.FC<ScheduleTableViewProps> = React.memo(({
  projects: propsProjects,
  tasks: propsTasks,
  projectId,
  onTaskClick,
  onAddFactory,
}) => {
  // Use context data if props are not provided (safely)
  let contextTasks: Task[] = [];
  let participants: any = null;
  let onTaskDelete: any = undefined;
  let onFactoryDelete: any = undefined;
  
  try {
    const taskContext = useTaskContext();
    contextTasks = taskContext.tasks || [];
    participants = taskContext.participants;
    onTaskDelete = taskContext.onTaskDelete;
    onFactoryDelete = taskContext.onFactoryDelete;
  } catch (error) {
    // Context not available, use defaults
    console.log('TaskContext not available, using defaults');
  }
  
  // State for refresh trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Use taskStore to get unified task data
  const { getTasksForProject } = useTaskStore();
  const storeTasks = projectId ? getTasksForProject(projectId) : [];
  
  // Get tasks from MockDB if not available elsewhere
  const mockDbTasks = useMemo(() => {
    try {
      if (projectId) {
        const tasks = mockDataService.getTasksByProjectId(projectId);
        console.log(`[TableView] Loading tasks for project ${projectId}:`);
        console.log(`[TableView] Found ${tasks.length} tasks`);
        
        // Log factory assignments for each task
        tasks.forEach(task => {
          const factoryCount = task.factoryAssignments?.length || 0;
          if (factoryCount > 0) {
            console.log(`  - ${task.title}: ${factoryCount} factories assigned`);
          }
        });
        
        return tasks;
      }
      return mockDataService.getAllTasks();
    } catch (error) {
      return [];
    }
  }, [projectId, refreshTrigger]); // Add refreshTrigger to dependencies
  
  // Listen for factory assignment events
  useEffect(() => {
    const handleFactoryAssigned = (event: CustomEvent) => {
      // If projectId matches or no projectId (showing all tasks), refresh
      if (!projectId || event.detail.projectId === projectId) {
        // Trigger refresh by updating the trigger
        setRefreshTrigger(prev => prev + 1);
      }
    };
    
    window.addEventListener('factory-assigned-to-tasks', handleFactoryAssigned as EventListener);
    
    return () => {
      window.removeEventListener('factory-assigned-to-tasks', handleFactoryAssigned as EventListener);
    };
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
        <TableHeader onAddFactory={onAddFactory} projectId={projectId} />
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