import React, { useState, useEffect } from 'react';
import type { Participant, Task, DragTooltip, ResizePreview } from '../../types/schedule';
import { isToday, isWeekend } from '../../utils/dateUtils';
import { assignTaskRows, getProjectRowCount } from '../../utils/taskUtils';
import TimelineHeader from './TimelineHeader';
import ProjectRow from './ProjectRow';

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

const ScheduleGrid: React.FC<ScheduleGridProps> = ({
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
  onMouseDown,
  onMouseMove,
  onMouseUp,
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
  onGridClick,
  onProjectSelect,
  onSelectAll,
  onAddFactory,
  onTaskCreate,
  onTaskDelete
}) => {
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
    // Toggle the clicked project and remember the action
    const projectId = projects[index].id;
    const isSelected = selectedProjects.includes(projectId);
    setDragAction(isSelected ? 'deselect' : 'select');
    onProjectSelect(projectId, !isSelected);
  };
  
  const handleProjectMouseEnter = (index: number) => {
    if (isDragSelecting && dragStartIndex !== null && dragAction) {
      setDragEndIndex(index);
      // Apply the same action (select or deselect) to all projects in range
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
        {/* Combined header - matching timeline header total height */}
        <div className="border-b-2 border-gray-300 bg-white" style={{ height: '70px' }}>
        </div>
        
        {/* Project names */}
        {allRows.map((project, index) => {
          const isAddFactoryRow = project.id === 'ADD_FACTORY_ROW_ID';
          const rowCount = isAddFactoryRow ? 1 : getProjectRowCount(project.id, tasks);
          const projectHeight = isAddFactoryRow ? 80 : (rowCount * 40 + 20); // rows + padding
          
          return (
            <div
              key={project.id}
              className={`border-b border-gray-200 flex items-center transition-all ${isAddFactoryRow ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'} ${
                dragOverProjectIndex === index ? 'bg-blue-50/50' : ''
              } ${draggedProjectIndex === index ? 'opacity-50' : ''}`}
              style={{ height: `${projectHeight}px`, minHeight: '80px' }}
              onDragOver={isAddFactoryRow ? undefined : (e) => {
                e.preventDefault();
                if (modalState.draggedProjectIndex !== null && modalState.draggedProjectIndex !== index) {
                  setModalState((prev: any) => ({ ...prev, dragOverProjectIndex: index }));
                }
              }}
              onDragLeave={isAddFactoryRow ? undefined : () => {
                setModalState((prev: any) => ({ ...prev, dragOverProjectIndex: null }));
              }}
              onDrop={isAddFactoryRow ? undefined : (e) => {
                e.preventDefault();
                if (modalState.draggedProjectIndex !== null && modalState.draggedProjectIndex !== index) {
                  // Reorder projects
                  const newProjects = [...projects];
                  const [draggedProject] = newProjects.splice(modalState.draggedProjectIndex, 1);
                  newProjects.splice(index, 0, draggedProject);
                  setProjects(newProjects);
                }
                setModalState((prev: any) => ({ ...prev, draggedProjectIndex: null, dragOverProjectIndex: null }));
              }}
              onClick={isAddFactoryRow ? undefined : undefined}
            >
            {isAddFactoryRow ? (
              <div className="flex items-center justify-center px-6 py-3 w-full">
                <div className="flex items-center text-gray-500 group-hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="font-medium">공장 추가</span>
                </div>
              </div>
            ) : (
              <div 
                className="flex items-center px-6 py-3 w-full select-none"
                onMouseEnter={() => handleProjectMouseEnter(index)}
              >
                <input
                  type="checkbox"
                  className="mr-3 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  checked={selectedProjects.includes(project.id)}
                  onChange={() => {}}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleProjectMouseDown(index);
                  }}
                />
                <div
                  className={`flex-1 cursor-move py-2 px-3 transition-all group ${
                    selectedProjects.includes(project.id) ? 'bg-blue-50' : ''
                  }`}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    setModalState((prev: any) => ({ ...prev, draggedProjectIndex: index }));
                  }}
                  onDragEnd={() => {
                    setModalState((prev: any) => ({ ...prev, draggedProjectIndex: null, dragOverProjectIndex: null }));
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-1 h-8 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: project.color }}
                    />
                    <div>
                      <div className="font-medium text-sm text-gray-900">{project.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{project.period ? project.period.replace(/\d{4}/g, (year) => year.slice(2)) : ''}</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteProject(project.id)}
                  className="ml-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="프로젝트 삭제"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
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
        <div 
          className="min-w-max relative"
        >
          {/* Timeline header with border */}
          <div className="border-b-2 border-gray-300">
            <TimelineHeader days={days} cellWidth={cellWidth} />
          </div>
          
          {allRows.map((project, index) => {
            const isAddFactoryRow = project.id === 'ADD_FACTORY_ROW_ID';
            // 프로젝트별 필요한 행 수 계산
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const rowCount = isAddFactoryRow ? 1 : getProjectRowCount(project.id, tasks);
            const projectHeight = isAddFactoryRow ? 80 : (rowCount * 40 + 20); // rows + padding
            
            return (
              <div
                key={project.id}
                className={`relative flex ${isAddFactoryRow ? '' : 'border-b border-gray-200'}`}
                style={{ height: `${projectHeight}px`, minHeight: '80px' }}
              >
              <div className="flex-1 relative bg-white/50" data-project-id={project.id}>
                <div className="absolute inset-0 flex">
                  {days.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`cursor-pointer hover:bg-blue-50/50 transition-colors ${isWeekend(day) ? 'bg-gray-100/50 hover:bg-gray-100' : 'hover:bg-blue-50/30'}`}
                      style={{ width: `${cellWidth}px` }}
                      onClick={isAddFactoryRow ? undefined : (e) => {
                        e.stopPropagation();
                        const clickedDate = day.toISOString().split('T')[0];
                        onGridClick(e, project.id, clickedDate);
                      }}
                      onDragOver={isAddFactoryRow ? undefined : (e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('bg-blue-100/70');
                      }}
                      onDragLeave={isAddFactoryRow ? undefined : (e) => {
                        e.currentTarget.classList.remove('bg-blue-100/70');
                      }}
                      onDrop={isAddFactoryRow ? undefined : (e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('bg-blue-100/70');
                        const dragData = e.dataTransfer.getData('text/plain');
                        const taskId = e.dataTransfer.getData('taskId');
                        const clickedDate = day.toISOString().split('T')[0];
                        
                        if (dragData === 'new-task') {
                          // 태스크 추가 버튼에서 드래그한 경우 바로 태스크 생성
                          const factory = projects.find(p => p.id === project.id);
                          if (factory) {
                            onTaskCreate && onTaskCreate({
                              projectId: project.id,
                              factory: factory.name,
                              startDate: clickedDate,
                              endDate: clickedDate // 1일짜리로 생성
                            });
                          }
                        } else if (taskId) {
                          // 기존 태스크를 드래그한 경우
                          e.stopPropagation();
                          const taskIndex = parseInt(e.dataTransfer.getData('taskIndex'));
                          onTaskDrop(e, project.id, taskIndex);
                        } else {
                          // 일반 클릭인 경우 모달 열기
                          onGridClick(e, project.id, clickedDate);
                        }
                      }}
                    />
                  ))}
                </div>
                {!isAddFactoryRow && (
                  <div className="relative h-full flex items-center pointer-events-none">
                    {/* 드래그 프리뷰 */}
                    {dragPreview && dragPreview.projectId === project.id && (
                      <div
                        className="absolute pointer-events-none"
                        style={{
                          left: `${(new Date(dragPreview.startDate).getTime() - days[0].getTime()) / (1000 * 60 * 60 * 24) * cellWidth}px`,
                          width: `${Math.max(cellWidth, ((new Date(dragPreview.endDate).getTime() - new Date(dragPreview.startDate).getTime()) / (1000 * 60 * 60 * 24) + 1) * cellWidth)}px`,
                          minWidth: `${cellWidth}px`,
                          top: '10px', // Perfect centering: 5px padding + 5px for centering (40-30)/2
                          height: '30px'
                        }}
                      >
                        <div className="relative h-full rounded-lg overflow-hidden bg-white border-2 border-blue-500 border-dashed animate-pulse">
                          <div className="relative h-full px-3 flex items-center">
                            <span className="text-xs text-blue-600 font-medium truncate">
                              {draggedTask?.title || '새 태스크'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {(() => {
                      // 태스크에 행 할당
                      const taskRows = assignTaskRows(projectTasks);
                      
                      return projectTasks.map((task, taskIndex) => {
                      // 리사이즈 미리보기가 있으면 해당 태스크에 적용
                      const isResizing = resizePreview && resizePreview.taskId === task.id;
                      const startDate = isResizing ? new Date(resizePreview.startDate) : new Date(task.startDate);
                      const endDate = isResizing ? new Date(resizePreview.endDate) : new Date(task.endDate);
                      // 드래그 중인 태스크는 투명하게
                      const isDragging = draggedTask && draggedTask.id === task.id;
                      
                        const taskRow = taskRows.get(task.id) || 0;
                        
                        return (
                          <div
                            key={task.id}
                            className={`absolute px-3 py-1.5 rounded-lg text-xs cursor-move transition-all pointer-events-auto group shadow-sm hover:shadow-lg hover:scale-[1.02] ${
                              hoveredTaskId === task.id ? 'ring-2 ring-blue-400 ring-offset-2' : ''
                            } ${isResizing ? 'opacity-70' : ''} ${isDragging ? 'opacity-50 cursor-grabbing' : ''} ${
                              task.isCompleted || task.status === 'completed' || task.status === 'approved' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-white border-2 border-blue-500 text-blue-600'
                            }`}
                            style={{
                              left: `${(startDate.getTime() - days[0].getTime()) / (1000 * 60 * 60 * 24) * cellWidth}px`,
                              width: `${Math.max(cellWidth, ((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1) * cellWidth)}px`,
                              minWidth: `${cellWidth}px`,
                              top: `${5 + taskRow * 40 + (40 - 30) / 2}px`, // Perfect centering: 5px top padding + row offset + 5px vertical centering
                              height: '30px'
                            }}
                        draggable
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick(task);
                        }}
                        onDragStart={(e) => onTaskDragStart(e, task, taskIndex)}
                        onDragEnd={onTaskDragEnd}
                        onDragOver={onTaskDragOver}
                        onDrop={(e) => onTaskDrop(e, project.id, taskIndex)}
                        onMouseEnter={() => onTaskHover(task.id)}
                        onMouseLeave={() => onTaskHover(null)}
                      >
                        <div className="truncate font-medium">{task.title}</div>
                        {/* Resize handles - placed first for lower z-index */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-blue-400 hover:bg-opacity-50 z-10 transition-colors"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            onTaskMouseDown(e, task, 'start');
                          }}
                        />
                        <div
                          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-blue-400 hover:bg-opacity-50 z-10 transition-colors"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            onTaskMouseDown(e, task, 'end');
                          }}
                        />
                        {/* Delete button - shows on hover, higher z-index */}
                        {hoveredTaskId === task.id && (
                          <button
                            className="absolute w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg z-20 transform translate-x-1/2 -translate-y-1/2 transition-all"
                            style={{
                              top: '0',
                              right: '0'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onTaskDelete && onTaskDelete(task.id);
                            }}
                          >
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
              </div>
            );
          })}
          
          {/* Today column highlight - inside the scrollable container */}
          {todayIndex >= 0 && (
            <div
              className="absolute top-0 bottom-0 bg-blue-100 opacity-30 z-10 pointer-events-none"
              style={{ 
                left: `${todayPosition}px`,
                width: `${cellWidth}px`,
                top: '68px' // After the header
              }}
            />
          )}
          
        </div>
      </div>
      
      {/* Drag tooltip */}
      {isDraggingTask && dragTooltip && (
        <div
          className="fixed bg-gray-900/95 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm pointer-events-none z-50 shadow-xl border border-gray-700"
          style={{ left: dragTooltip.x + 20, top: dragTooltip.y - 40 }}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{dragTooltip.date}</span>
          </div>
        </div>
      )}
      
      {/* Resize preview */}
      {resizePreview && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm z-50 shadow-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{resizePreview.startDate} ~ {resizePreview.endDate}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleGrid;