import React from 'react';
import type { Participant, Task, ResizePreview } from '../../../types/schedule';
import { isToday } from '../../../utils/dateUtils';
import { getProjectRowCount } from '../../../utils/taskUtils';
import { getTasksForFactory } from '../../../utils/scheduleUtils';
import TimelineHeader from '../TimelineHeader';
import ProjectRow from './ProjectRow';
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
  scrollRef: React.RefObject<HTMLDivElement>;
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

// Custom scrollbar styles
const scrollbarStyles = `
  .timeline-scroll::-webkit-scrollbar {
    height: 10px;
  }
  .timeline-scroll::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 5px;
  }
  .timeline-scroll::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 5px;
    transition: background 0.2s;
  }
  .timeline-scroll::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
  .timeline-scroll {
    scrollbar-width: thin;
    scrollbar-color: #d1d5db #f3f4f6;
  }
`;

const ScheduleTimelineGrid: React.FC<ScheduleTimelineGridProps> = (props) => {
  // Count total tasks being rendered across all projects
  React.useEffect(() => {
    let totalRenderedTasks = 0;
    const tasksByProject: Record<string, number> = {};
    
    props.projects.forEach(project => {
      const projectTasks = getTasksForFactory(props.tasks, project);
      tasksByProject[project.name] = projectTasks.length;
      totalRenderedTasks += projectTasks.length;
    });
    
  }, [props.tasks, props.projects]);
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
    scrollRef,
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
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div 
        ref={scrollRef} 
        className="w-full overflow-x-auto overflow-y-hidden relative timeline-scroll" 
        style={{ 
          backgroundColor: 'rgba(249, 250, 251, 0.3)', 
          position: 'relative',
          maxWidth: '100%',
          height: 'fit-content'
        }}
      >
      <div className="min-w-max relative" style={{ position: 'relative', overflow: 'visible' }}>
        {/* Timeline header with border */}
        <div className="border-b border-gray-200">
          <TimelineHeader days={days} cellWidth={cellWidth} />
        </div>
        
        {/* Project rows - now using separated ProjectRow component */}
        {allRows.map((project) => {
          const isAddFactoryRow = project.id === 'ADD_FACTORY_ROW_ID';
          
          return (
            <ProjectRow
              key={project.id}
              project={project}
              tasks={tasks}
              days={days}
              cellWidth={cellWidth}
              isAddFactoryRow={isAddFactoryRow}
              hoveredTaskId={hoveredTaskId}
              isDraggingTask={isDraggingTask}
              resizePreview={resizePreview}
              dragPreview={dragPreview}
              draggedTask={draggedTask}
              modalState={modalState}
              scrollRef={scrollRef}
              allRows={allRows}
              onGridClick={onGridClick}
              onTaskClick={onTaskClick}
              onTaskDragStart={onTaskDragStart}
              onTaskDragEnd={onTaskDragEnd}
              onTaskDragOver={onTaskDragOver}
              onTaskDrop={onTaskDrop}
              onTaskMouseDown={onTaskMouseDown}
              onTaskHover={onTaskHover}
              onTaskDelete={onTaskDelete}
            />
          );
        })}
        
        {/* 공장 추가 행 아래 경계선 */}
        <div className="border-b border-gray-200" style={{ height: '1px' }}></div>
        
        {/* SCROLL-SYNCHRONIZED Global drag preview - 스크롤과 완벽 동기화 */}
        {dragPreview && dragPreview.projectId && dragPreview.startDate && (() => {
          const targetProject = allRows.find(p => p.id === dragPreview.projectId && p.id !== 'ADD_FACTORY_ROW_ID');
          
          if (!targetProject) {
            return null;
          }
          
          const projectIndex = allRows.findIndex(p => p.id === dragPreview.projectId);
          const totalHeightAbove = allRows.slice(0, projectIndex).reduce((sum, p) => {
            const rowCount = p.id === 'ADD_FACTORY_ROW_ID' ? 1 : getProjectRowCount(p.id, tasks, p.name);
            const height = p.id === 'ADD_FACTORY_ROW_ID' ? 50 : Math.max(50, rowCount * 40 + 20);
            return sum + height;
          }, 0);
          
          
          return (
            <div
              className="absolute pointer-events-none"
              style={{
                top: `${52 + totalHeightAbove + 15}px`, // Header + project offset + task offset
                left: '0px',
                right: '0px', 
                width: '100%',
                height: '30px',
                zIndex: 999, // Below factory names but above tasks
                overflow: 'visible', // Allow preview to extend beyond container
                position: 'absolute',
                pointerEvents: 'none'
              }}
            >
              <DragPreview
                projectId={dragPreview.projectId}
                startDate={dragPreview.startDate}
                endDate={dragPreview.endDate}
                draggedTask={draggedTask}
                days={days}
                cellWidth={cellWidth}
                scrollLeft={scrollRef.current?.scrollLeft || 0}
              />
            </div>
          );
        })()}
      </div>
    </div>
    </>
  );
};

export default ScheduleTimelineGrid;