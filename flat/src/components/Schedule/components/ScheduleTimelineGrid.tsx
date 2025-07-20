import React from 'react';
import type { Participant, Task, ResizePreview } from '../../../types/schedule';
import { isToday } from '../../../utils/dateUtils';
import { assignTaskRows, getProjectRowCount } from '../../../utils/taskUtils';
import TimelineHeader from '../TimelineHeader';
import GridCell from './GridCell';
import TaskItem from './TaskItem';
import DragPreview from './DragPreview';

interface ScheduleTimelineGridProps {
  projects: Participant[];
  tasks: Task[];
  days: Date[];
  cellWidth: number;
  hoveredTaskId: number | null;
  isDraggingTask: boolean;
  resizePreview: ResizePreview | null;
  dragPreview: { projectId: string; startDate: string; endDate: string } | null;
  draggedTask: Task | null;
  modalState: any;
  onGridClick: (e: React.MouseEvent, projectId: string, date: string) => void;
  onTaskClick: (task: Task) => void;
  onTaskDragStart: (e: React.DragEvent, task: Task, index: number) => void;
  onTaskDragEnd: () => void;
  onTaskDragOver: (e: React.DragEvent) => void;
  onTaskDrop: (e: React.DragEvent, projectId: string, dropIndex: number) => void;
  onTaskMouseDown: (e: React.MouseEvent, task: Task, direction: 'start' | 'end') => void;
  onTaskHover: (taskId: number | null) => void;
  onTaskCreate?: (task: { projectId: string; factory: string; startDate: string; endDate: string }) => void;
  onTaskDelete?: (taskId: number) => void;
}

const ScheduleTimelineGrid: React.FC<ScheduleTimelineGridProps> = (props) => {
  const {
    projects,
    tasks,
    days,
    cellWidth,
    hoveredTaskId,
    isDraggingTask,
    resizePreview,
    dragPreview,
    draggedTask,
    modalState,
    onGridClick,
    onTaskClick,
    onTaskDragStart,
    onTaskDragEnd,
    onTaskDragOver,
    onTaskDrop,
    onTaskMouseDown,
    onTaskHover,
    onTaskCreate,
    onTaskDelete
  } = props;

  // Find today's position for today line
  const todayIndex = days.findIndex(day => isToday(day));
  const todayPosition = todayIndex * cellWidth;

  // Add dummy project for "Add Factory" row
  const addFactoryProject: Participant = {
    id: 'ADD_FACTORY_ROW_ID',
    name: '공장 추가',
    period: '',
    color: '',
    type: ''
  };

  const allRows = [...projects, addFactoryProject];

  return (
    <div className="flex-1 overflow-x-auto" style={{ overflowY: 'hidden', backgroundColor: 'rgba(249, 250, 251, 0.3)' }}>
      <div className="min-w-max relative">
        {/* Timeline header with border */}
        <div className="border-b border-gray-200">
          <TimelineHeader days={days} cellWidth={cellWidth} />
        </div>
        
        {/* Project rows */}
        {allRows.map((project) => {
          const isAddFactoryRow = project.id === 'ADD_FACTORY_ROW_ID';
          const projectTasks = tasks.filter(t => t.projectId === project.id);
          const rowCount = isAddFactoryRow ? 1 : getProjectRowCount(project.id, tasks);
          const projectHeight = isAddFactoryRow ? 50 : Math.max(50, rowCount * 40 + 20);
          
          return (
            <div
              key={project.id}
              className={`relative flex ${isAddFactoryRow ? '' : 'border-b border-gray-200'}`}
              style={{ height: `${projectHeight}px`, minHeight: '50px' }}
            >
              <div className="flex-1 relative bg-white/50" data-project-id={project.id}>
                <div className="absolute inset-0 flex">
                  {days.map((day, dayIndex) => (
                    <GridCell
                      key={dayIndex}
                      day={day}
                      cellWidth={cellWidth}
                      projectId={project.id}
                      isAddFactoryRow={isAddFactoryRow}
                      onClick={!isAddFactoryRow ? (e) => {
                        e.stopPropagation();
                        const clickedDate = day.toISOString().split('T')[0];
                        onGridClick(e, project.id, clickedDate);
                      } : undefined}
                      onDragOver={!isAddFactoryRow ? (e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('bg-blue-100/70');
                      } : undefined}
                      onDragLeave={!isAddFactoryRow ? (e) => {
                        e.currentTarget.classList.remove('bg-blue-100/70');
                      } : undefined}
                      onDrop={!isAddFactoryRow ? (e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('bg-blue-100/70');
                        const dragData = e.dataTransfer.getData('text/plain');
                        const taskId = e.dataTransfer.getData('taskId');
                        const clickedDate = day.toISOString().split('T')[0];
                        
                        if (dragData === 'new-task') {
                          const factory = projects.find(p => p.id === project.id);
                          if (factory) {
                            props.onGridClick(e, project.id, clickedDate);
                          }
                        } else if (taskId) {
                          e.stopPropagation();
                          const taskIndex = parseInt(e.dataTransfer.getData('taskIndex'));
                          props.onTaskDrop(e, project.id, taskIndex);
                        } else {
                          onGridClick(e, project.id, clickedDate);
                        }
                      } : undefined}
                    />
                  ))}
                </div>
                
                {/* Tasks and drag preview */}
                {!isAddFactoryRow && (
                  <div className="relative h-full flex items-center pointer-events-none">
                    {/* Drag preview */}
                    {dragPreview && dragPreview.projectId === project.id && (
                      <DragPreview
                        projectId={dragPreview.projectId}
                        startDate={dragPreview.startDate}
                        endDate={dragPreview.endDate}
                        draggedTask={draggedTask}
                        days={days}
                        cellWidth={cellWidth}
                      />
                    )}
                    
                    {/* Tasks */}
                    {(() => {
                      const taskRows = assignTaskRows(projectTasks);
                      
                      return projectTasks.map((task, taskIndex) => {
                        const isResizing = resizePreview && resizePreview.taskId === task.id;
                        const startDate = isResizing ? new Date(resizePreview.startDate) : new Date(task.startDate);
                        const endDate = isResizing ? new Date(resizePreview.endDate) : new Date(task.endDate);
                        const taskRow = taskRows.get(task.id) || 0;
                      
                      const left = (startDate.getTime() - days[0].getTime()) / (1000 * 60 * 60 * 24) * cellWidth;
                      const width = Math.max(cellWidth, ((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1) * cellWidth);
                      // Center task vertically: 10px base padding + row * 40px + 5px to center 30px task in 40px row
                      const top = 10 + taskRow * 40 + 5;
                      
                      return (
                        <TaskItem
                          key={task.id}
                          task={task}
                          startDate={startDate}
                          endDate={endDate}
                          left={left}
                          width={width}
                          top={top}
                          isDragging={!!draggedTask && draggedTask.id === task.id}
                          isResizing={!!isResizing}
                          isHovered={hoveredTaskId === task.id}
                          onDragStart={(e) => onTaskDragStart(e, task, taskIndex)}
                          onDragEnd={onTaskDragEnd}
                          onDragOver={onTaskDragOver}
                          onDrop={(e) => onTaskDrop(e, project.id, taskIndex)}
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskClick(task);
                          }}
                          onMouseEnter={() => onTaskHover(task.id)}
                          onMouseLeave={() => onTaskHover(null)}
                          onResizeStart={(e, direction) => onTaskMouseDown(e, task, direction)}
                          onDelete={onTaskDelete ? () => onTaskDelete(task.id) : undefined}
                        />
                      );
                    });
                    })()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
      </div>
    </div>
  );
};

export default ScheduleTimelineGrid;