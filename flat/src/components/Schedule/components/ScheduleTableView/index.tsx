import React, { useMemo } from 'react';
import type { Participant, Task } from '../../../../types/schedule';
import { useTaskContext } from '../../../../contexts/AppContext';
import TableHeader from './TableHeader';
import TaskRow from './TaskRow';
import EmptyState from './EmptyState';

interface ScheduleTableViewProps {
  projects?: Participant[];
  tasks?: Task[];
  onTaskClick?: (task: Task) => void;
  onDeleteProject?: (projectId: string) => void;
}

const ScheduleTableView: React.FC<ScheduleTableViewProps> = React.memo(({
  projects: propsProjects,
  tasks: propsTasks,
  onTaskClick,
  onDeleteProject,
}) => {
  // Use context data if props are not provided
  const { tasks: contextTasks, participants, onTaskDelete, onFactoryDelete } = useTaskContext();
  
  const tasks = propsTasks || contextTasks;
  const projects = propsProjects || participants;

  // Sort all tasks by start date
  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    ),
    [tasks]
  );

  // Create a map of project id to project for quick lookup
  const projectMap = useMemo(
    () => new Map(projects.map(p => [p.id, p])),
    [projects]
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
            // projectId로 매칭되는 프로젝트를 찾거나, factory 이름으로 찾기
            const project = projectMap.get(task.projectId) || 
                           projects.find(p => p.name === task.factory);
            
            return (
              <TaskRow
                key={task.id}
                task={task}
                project={project}
                projects={projects}
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