import React, { useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import type { Participant, Task } from '../../types/schedule';
import { isWeekend } from '../../utils/dateUtils';
import TaskItem from './TaskItem';

interface ProjectRowProps {
  project: Participant;
  tasks: Task[];
  days: Date[];
  cellWidth: number;
  hoveredTaskId: number | null;
  isDraggingProject: boolean;
  onTaskClick: (task: Task) => void;
  onTaskDragStart: (e: React.DragEvent, task: Task, index: number) => void;
  onTaskDragEnd: () => void;
  onTaskDragOver: (e: React.DragEvent) => void;
  onTaskDrop: (e: React.DragEvent, projectId: string, dropIndex: number) => void;
  onTaskMouseDown: (e: React.MouseEvent, task: Task, direction: 'start' | 'end') => void;
  onTaskHover: (taskId: number | null) => void;
  onProjectDragStart: (e: React.DragEvent, index: number) => void;
  onProjectDragEnd: () => void;
  onProjectDragOver: (e: React.DragEvent) => void;
  onProjectDrop: (e: React.DragEvent, index: number) => void;
  onDeleteProject: (projectId: string) => void;
  projectIndex: number;
  isDragOver: boolean;
}

const ProjectRow: React.FC<ProjectRowProps> = ({
  project,
  tasks,
  days,
  cellWidth,
  hoveredTaskId,
  isDraggingProject,
  onTaskClick,
  onTaskDragStart,
  onTaskDragEnd,
  onTaskDragOver,
  onTaskDrop,
  onTaskMouseDown,
  onTaskHover,
  onProjectDragStart,
  onProjectDragEnd,
  onProjectDragOver,
  onProjectDrop,
  onDeleteProject,
  projectIndex,
  isDragOver
}) => {
  const projectTasks = useMemo(
    () => tasks.filter(task => task.projectId === project.id),
    [tasks, project.id]
  );

  return (
    <div
      className={`flex border-b border-gray-200 relative transition-all ${
        isDragOver ? 'bg-blue-50' : ''
      } ${isDraggingProject ? 'opacity-50' : ''}`}
      onDragOver={onProjectDragOver}
      onDrop={(e) => onProjectDrop(e, projectIndex)}
    >
      <div
        className={`w-64 px-4 py-8 font-medium border-r border-gray-300 flex items-center justify-between cursor-move ${
          project.color
        } bg-opacity-10`}
        draggable
        onDragStart={(e) => onProjectDragStart(e, projectIndex)}
        onDragEnd={onProjectDragEnd}
      >
        <div>
          <div className="font-semibold">{project.name}</div>
          <div className="text-xs text-gray-600 mt-1">{project.period}</div>
        </div>
        <button
          onClick={() => onDeleteProject(project.id)}
          className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
          title="프로젝트 삭제"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 relative bg-white" style={{ minHeight: '80px' }}>
        <div className="absolute inset-0 flex">
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className={`${isWeekend(day) ? 'bg-gray-100' : ''}`}
              style={{ width: `${cellWidth}px` }}
            />
          ))}
        </div>
        <div className="relative h-full flex items-center">
          {projectTasks.map((task, index) => (
            <TaskItem
              key={task.id}
              task={task}
              index={index}
              isHovered={hoveredTaskId === task.id}
              onTaskClick={onTaskClick}
              onTaskDragStart={onTaskDragStart}
              onTaskDragEnd={onTaskDragEnd}
              onTaskDragOver={onTaskDragOver}
              onTaskDrop={onTaskDrop}
              onTaskMouseDown={onTaskMouseDown}
              onTaskHover={onTaskHover}
              projectId={project.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectRow;