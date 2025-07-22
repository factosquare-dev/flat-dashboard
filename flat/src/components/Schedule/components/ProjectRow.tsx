import React from 'react';
import type { Participant, Task } from '../../../types/schedule';
import { getProjectRowCount, assignTaskRows } from '../../../utils/taskUtils';
import { GridCoordinateCalculator } from '../utils/dragCalculations';
import { getInteractionState } from '../utils/globalState';
import GridCell from './GridCell';
import TaskItem from './TaskItem';

interface ProjectRowProps {
  project: Participant;
  tasks: Task[];
  days: Date[];
  cellWidth: number;
  isAddFactoryRow: boolean;
  hoveredTaskId: number | null;
  isDraggingTask: boolean;
  resizePreview: any;
  dragPreview: any;
  draggedTask: Task | null;
  modalState: any;
  scrollRef: React.RefObject<HTMLDivElement>;
  allRows: Participant[];
  onGridClick: (e: React.MouseEvent, projectId: string, date: string) => void;
  onTaskClick: (task: Task) => void;
  onTaskDragStart: (e: React.DragEvent, task: Task, index: number) => void;
  onTaskDragEnd: () => void;
  onTaskDragOver: (e: React.DragEvent) => void;
  onTaskDrop: (e: React.DragEvent, projectId: string, dropIndex: number) => void;
  onTaskMouseDown: (e: React.MouseEvent, task: Task, direction: 'start' | 'end') => void;
  onTaskHover: (taskId: number | null) => void;
  onTaskDelete?: (taskId: number) => void;
}

const ProjectRow: React.FC<ProjectRowProps> = ({
  project,
  tasks,
  days,
  cellWidth,
  isAddFactoryRow,
  hoveredTaskId,
  isDraggingTask,
  resizePreview,
  dragPreview,
  draggedTask,
  modalState,
  scrollRef,
  allRows,
  onGridClick,
  onTaskClick,
  onTaskDragStart,
  onTaskDragEnd,
  onTaskDragOver,
  onTaskDrop,
  onTaskMouseDown,
  onTaskHover,
  onTaskDelete
}) => {
  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const rowCount = isAddFactoryRow ? 1 : getProjectRowCount(project.id, tasks);
  const projectHeight = isAddFactoryRow ? 50 : Math.max(50, rowCount * 40 + 20);

  return (
    <div
      key={project.id}
      className={`relative flex ${isAddFactoryRow ? 'bg-white border-b border-gray-200' : 'border-b border-gray-200'} project-row`}
      style={{ height: `${projectHeight}px`, minHeight: '50px' }}
    >
      <div className="flex-1 relative bg-white/50" data-project-id={project.id}>
        {/* Grid Cells Layer */}
        <div className="absolute inset-0 flex">
          {days.map((day, dayIndex) => (
            <GridCell
              key={dayIndex}
              day={day}
              cellWidth={cellWidth}
              projectId={project.id}
              isAddFactoryRow={isAddFactoryRow}
              onClick={!isAddFactoryRow ? (e) => {
                // Check if click target is the cell itself
                if (e.target !== e.currentTarget) {
                  console.log('[GridCell] Click blocked - not direct cell click');
                  return;
                }
                
                // Check global interaction state
                const state = getInteractionState();
                if (state.mode !== 'idle' || Date.now() < state.preventClickUntil) {
                  console.log('[GridCell] Click blocked by interaction state:', state.mode);
                  return;
                }
                
                // Additional safety check
                if (modalState.isResizingTask || modalState.isDraggingTask) {
                  console.log('[GridCell] Click blocked - operation in progress');
                  return;
                }
                
                const clickedDate = day.toISOString().split('T')[0];
                console.log('[GridCell] Click allowed - opening new task modal');
                onGridClick(e, project.id, clickedDate);
              } : undefined}
              onDragOver={!isAddFactoryRow ? (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'move';
              } : undefined}
              onDragLeave={!isAddFactoryRow ? (e) => {
                // No cleanup needed
              } : undefined}
              onDrop={!isAddFactoryRow ? (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const dragData = e.dataTransfer.getData('text/plain');
                const taskIdStr = e.dataTransfer.getData('taskId');
                
                // Calculate date using unified grid calculator
                const rect = scrollRef.current?.getBoundingClientRect();
                const fallbackDate = day.toISOString().split('T')[0];
                let clickedDate = fallbackDate;
                
                if (rect && draggedTask) {
                  const dropCalculator = new GridCoordinateCalculator({
                    days,
                    cellWidth,
                    scrollLeft: scrollRef.current?.scrollLeft || 0,
                    containerRect: rect
                  });
                  
                  const calculatedDate = dropCalculator.mouseXToDate(e.clientX, true);
                  clickedDate = calculatedDate.toISOString().split('T')[0];
                  
                  console.log('[GridCell DROP] Unified date calculation:', {
                    clientX: e.clientX,
                    rectLeft: rect.left,
                    scrollLeft: scrollRef.current?.scrollLeft || 0,
                    calculatedDate: clickedDate,
                    fallbackDate,
                    cellWidth,
                    method: 'unified'
                  });
                }
                
                console.log('[GridCell DROP] Drop on cell:', {
                  projectId: project.id,
                  clickedDate,
                  taskId: taskIdStr,
                  dragData
                });
                
                if (dragData === 'new-task' && !taskIdStr) {
                  console.log('[GridCell DROP] Creating new task');
                  const factory = allRows.find(p => p.id === project.id);
                  if (factory) {
                    onGridClick(e, project.id, clickedDate);
                  }
                } else if (taskIdStr && taskIdStr !== '') {
                  console.log('[GridCell DROP] TASK DROP ATTEMPT:', {
                    taskId: taskIdStr,
                    targetProjectId: project.id,
                    hasDragPreview: !!dragPreview,
                    dragPreviewContent: dragPreview,
                    isDraggingTask: isDraggingTask,
                    hasDraggedTask: !!draggedTask,
                    draggedTaskId: draggedTask?.id
                  });
                  
                  // SIMPLIFIED CONDITION: Just check if we have a dragged task
                  if (!isDraggingTask || !draggedTask) {
                    console.log('[GridCell DROP] Drop blocked - no active drag:', {
                      isDraggingTask,
                      hasDraggedTask: !!draggedTask
                    });
                    return;
                  }
                  
                  console.log('[GridCell DROP] ✅ DROP ALLOWED - calling onTaskDrop');
                  
                  try {
                    onTaskDrop(e, project.id, 0);
                    console.log('[GridCell DROP] ✅ onTaskDrop called successfully');
                  } catch (error) {
                    console.error('[GridCell DROP] ❌ Error calling onTaskDrop:', error);
                  }
                }
              } : undefined}
            />
          ))}
        </div>
        
        {/* Tasks Layer */}
        {!isAddFactoryRow && (
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 15 }}>
            {(() => {
              const taskRows = assignTaskRows(projectTasks);
              const calculator = new GridCoordinateCalculator({
                days,
                cellWidth,
                scrollLeft: 0 // TaskItems use absolute positioning
              });
              
              return projectTasks.map((task, taskIndex) => {
                // CRITICAL: Check both modalState and preview to determine resize state
                const isThisTaskBeingResized = modalState.isResizingTask && 
                                               modalState.resizingTask?.id === task.id && 
                                               !modalState.isDraggingTask;
                const startDate = isThisTaskBeingResized && resizePreview ? new Date(resizePreview.startDate) : new Date(task.startDate);
                const endDate = isThisTaskBeingResized && resizePreview ? new Date(resizePreview.endDate) : new Date(task.endDate);
                const taskRow = taskRows.get(task.id) || 0;
              
                const position = calculator.calculateTaskPosition(startDate, endDate, false);
                const left = position.x;
                const width = position.width;
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
                    isResizing={!!isThisTaskBeingResized}
                    isHovered={hoveredTaskId === task.id}
                    isDraggingAnyTask={isDraggingTask}
                    dragPreview={dragPreview}
                    allRows={allRows}
                    modalState={modalState}
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
};

export default ProjectRow;