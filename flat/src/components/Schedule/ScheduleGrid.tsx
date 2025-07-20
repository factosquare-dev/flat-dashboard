import React, { useState, useEffect } from 'react';
import type { Participant, Task, DragTooltip, ResizePreview } from '../../types/schedule';
import { isToday } from '../../utils/dateUtils';
import { assignTaskRows, getProjectRowCount } from '../../utils/taskUtils';
import TimelineHeader from './TimelineHeader';
import ProjectHeader from './components/ProjectHeader';
import AddFactoryRow from './components/AddFactoryRow';
import GridCell from './components/GridCell';
import TaskItem from './components/TaskItem';
import DragPreview from './components/DragPreview';
import DragTooltipComponent from './components/DragTooltip';
import ResizePreviewComponent from './components/ResizePreview';

interface ScheduleGridProps {
  projects: Participant[];
  tasks: Task[];
  days: Date[];
  cellWidth: number;
  scrollRef: React.RefObject<HTMLDivElement>;
  hoveredTaskId: number | null;
  draggedProjectIndex: number | null;
  dragOverProjectIndex: number | null;
  isDraggingTask: boolean;
  dragTooltip: DragTooltip | null;
  resizePreview: ResizePreview | null;
  dragPreview: { projectId: string; startDate: string; endDate: string } | null;
  draggedTask: Task | null;
  selectedProjects: string[];
  modalState: any;
  setModalState: any;
  setProjects: (projects: Participant[]) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
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
  onGridClick: (e: React.MouseEvent, projectId: string, date: string) => void;
  onProjectSelect: (projectId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onAddFactory?: () => void;
  onTaskCreate?: (task: { projectId: string; factory: string; startDate: string; endDate: string }) => void;
  onTaskDelete?: (taskId: number) => void;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = (props) => {
  const {
    projects,
    tasks,
    days,
    cellWidth,
    scrollRef,
    hoveredTaskId,
    draggedProjectIndex,
    dragOverProjectIndex,
    isDraggingTask,
    dragTooltip,
    resizePreview,
    dragPreview,
    draggedTask,
    selectedProjects,
    modalState,
    setModalState,
    setProjects,
    onProjectSelect,
    onDeleteProject,
    onGridClick,
    onTaskCreate,
    onTaskDelete,
    // ... other props
  } = props;

  // Find today's position for auto-scroll and today line
  const todayIndex = days.findIndex(day => isToday(day));
  const todayPosition = todayIndex * cellWidth;
  
  // Drag selection state
  const [isDragSelecting, setIsDragSelecting] = useState(false);
  const [dragStartIndex, setDragStartIndex] = useState<number | null>(null);
  const [dragEndIndex, setDragEndIndex] = useState<number | null>(null);
  const [dragAction, setDragAction] = useState<'select' | 'deselect' | null>(null);
  
  const handleProjectMouseDown = (index: number) => {
    setIsDragSelecting(true);
    setDragStartIndex(index);
    setDragEndIndex(index);
    const projectId = projects[index].id;
    const isSelected = selectedProjects.includes(projectId);
    setDragAction(isSelected ? 'deselect' : 'select');
    onProjectSelect(projectId, !isSelected);
  };
  
  const handleProjectMouseEnter = (index: number) => {
    if (isDragSelecting && dragStartIndex !== null && dragAction) {
      setDragEndIndex(index);
      const start = Math.min(dragStartIndex, index);
      const end = Math.max(dragStartIndex, index);
      for (let i = start; i <= end; i++) {
        const projectId = projects[i].id;
        const isSelected = selectedProjects.includes(projectId);
        if (dragAction === 'select' && !isSelected) {
          onProjectSelect(projectId, true);
        } else if (dragAction === 'deselect' && isSelected) {
          onProjectSelect(projectId, false);
        }
      }
    }
  };
  
  const handleMouseUp = () => {
    setIsDragSelecting(false);
    setDragStartIndex(null);
    setDragEndIndex(null);
    setDragAction(null);
  };
  
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Add a dummy project for the "Add Factory" row
  const addFactoryProject: Participant = {
    id: 'ADD_FACTORY_ROW_ID',
    name: '공장 추가',
    period: '',
    color: '',
    type: ''
  };

  const allRows = [...projects, addFactoryProject];

  return (
    <div className="bg-white flex h-full overflow-hidden relative">
      {/* Fixed left column - Project names */}
      <div className="w-72 bg-white border-r border-gray-200 flex-shrink-0">
        {/* Combined header - matching timeline header total height (24px + 28px + 2px border) */}
        <div className="border-b-2 border-gray-300 bg-white flex items-center justify-center" style={{ height: '54px' }}>
          <span className="text-xs font-medium text-gray-600">공장</span>
        </div>
        
        {/* Project names */}
        {allRows.map((project, index) => {
          const isAddFactoryRow = project.id === 'ADD_FACTORY_ROW_ID';
          const rowCount = isAddFactoryRow ? 1 : getProjectRowCount(project.id, tasks);
          const projectHeight = isAddFactoryRow ? 50 : Math.max(50, rowCount * 40 + 20);
          
          if (isAddFactoryRow) {
            return <AddFactoryRow key={project.id} height={projectHeight} />;
          }
          
          return (
            <div key={project.id} onDragOver={(e) => {
              e.preventDefault();
              if (modalState.draggedProjectIndex !== null && modalState.draggedProjectIndex !== index) {
                setModalState((prev: any) => ({ ...prev, dragOverProjectIndex: index }));
              }
            }}
            onDragLeave={() => {
              setModalState((prev: any) => ({ ...prev, dragOverProjectIndex: null }));
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (modalState.draggedProjectIndex !== null && modalState.draggedProjectIndex !== index) {
                const newProjects = [...projects];
                const [draggedProject] = newProjects.splice(modalState.draggedProjectIndex, 1);
                newProjects.splice(index, 0, draggedProject);
                setProjects(newProjects);
              }
              setModalState((prev: any) => ({ ...prev, draggedProjectIndex: null, dragOverProjectIndex: null }));
            }}>
              <ProjectHeader
                project={project}
                index={index}
                isSelected={selectedProjects.includes(project.id)}
                isDragging={draggedProjectIndex === index}
                isDropTarget={dragOverProjectIndex === index}
                projectHeight={projectHeight}
                onCheckboxChange={(checked) => onProjectSelect(project.id, checked)}
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  setModalState((prev: any) => ({ ...prev, draggedProjectIndex: index }));
                }}
                onDragEnd={() => {
                  setModalState((prev: any) => ({ ...prev, draggedProjectIndex: null, dragOverProjectIndex: null }));
                }}
                onDelete={() => onDeleteProject(project.id)}
                onMouseEnter={() => handleProjectMouseEnter(index)}
              />
            </div>
          );
        })}
      </div>
      
      {/* Scrollable right column - Gantt chart */}
      <div 
        className="flex-1" 
        ref={scrollRef}
        style={{ 
          overflowX: 'auto',
          overflowY: 'hidden',
          backgroundColor: 'rgba(249, 250, 251, 0.3)'
        }}
      >
        <div className="min-w-max relative">
          {/* Timeline header with border */}
          <div className="border-b-2 border-gray-300">
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
                              onTaskCreate && onTaskCreate({
                                projectId: project.id,
                                factory: factory.name,
                                startDate: clickedDate,
                                endDate: clickedDate
                              });
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
                          const isDragging = draggedTask && draggedTask.id === task.id;
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
                              isDragging={!!isDragging}
                              isResizing={!!isResizing}
                              isHovered={hoveredTaskId === task.id}
                              onDragStart={(e) => props.onTaskDragStart(e, task, taskIndex)}
                              onDragEnd={props.onTaskDragEnd}
                              onDragOver={props.onTaskDragOver}
                              onDrop={(e) => props.onTaskDrop(e, project.id, taskIndex)}
                              onClick={(e) => {
                                e.stopPropagation();
                                props.onTaskClick(task);
                              }}
                              onMouseEnter={() => props.onTaskHover(task.id)}
                              onMouseLeave={() => props.onTaskHover(null)}
                              onResizeStart={(e, direction) => props.onTaskMouseDown(e, task, direction)}
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
      
      {/* Tooltips */}
      {isDraggingTask && dragTooltip && (
        <DragTooltipComponent tooltip={dragTooltip} />
      )}
      
      {resizePreview && (
        <ResizePreviewComponent preview={resizePreview} />
      )}
    </div>
  );
};

export default ScheduleGrid;