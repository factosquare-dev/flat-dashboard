import React, { useEffect, useState, useRef, useCallback } from 'react';

// Types
interface Task {
  id: string | number;
  title: string;
  projectId: string;
  startDate: string;
  endDate: string;
  color: string;
}

interface Project {
  id: string;
  name: string;
  tasks: Task[];
  color: string;
  expanded?: boolean;
}

interface DragState {
  isDragging: boolean;
  draggedTask: Task | null;
  ghostPosition: { x: number; y: number } | null;
  hoveredCell: { row: number; col: number } | null;
  mouseOffset: { x: number; y: number };
}

// Constants
const CELL_WIDTH = 40;
const CELL_HEIGHT = 40;
const HEADER_HEIGHT = 60;
const SIDEBAR_WIDTH = 192; // w-48 = 12rem = 192px
const baseDate = new Date("2025-07-01");
const endDate = new Date("2025-08-31");
const totalDays = Math.floor((endDate - baseDate) / (1000 * 60 * 60 * 24)) + 1;

// Helper functions
const dateToString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const stringToDate = (dateStr: string): Date => {
  return new Date(dateStr + 'T00:00:00');
};

const getDateIndex = (dateStr: string): number => {
  const date = stringToDate(dateStr);
  return Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
};

const getDateFromIndex = (index: number): string => {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + index);
  return dateToString(date);
};

const getDuration = (startDate: string, endDate: string): number => {
  const start = stringToDate(startDate);
  const end = stringToDate(endDate);
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

// Sample data with proper project structure
const projectsData: Project[] = [
  {
    id: "qcell",
    name: "큐셀시스템",
    color: "bg-blue-500",
    expanded: true,
    tasks: [
      {
        id: "qcell-1",
        title: "시스템 기획",
        projectId: "qcell",
        startDate: "2025-07-15",
        endDate: "2025-07-17",
        color: "bg-blue-400"
      },
      {
        id: "qcell-2",
        title: "데이터베이스 설계",
        projectId: "qcell",
        startDate: "2025-07-16",
        endDate: "2025-07-19",
        color: "bg-blue-500"
      },
      {
        id: "qcell-3",
        title: "API 개발",
        projectId: "qcell",
        startDate: "2025-07-18",
        endDate: "2025-07-22",
        color: "bg-blue-600"
      },
      {
        id: "qcell-4",
        title: "UI 개발",
        projectId: "qcell",
        startDate: "2025-07-20",
        endDate: "2025-07-25",
        color: "bg-blue-700"
      }
    ]
  },
  {
    id: "yeonwoo",
    name: "(주)연우",
    color: "bg-red-500",
    expanded: true,
    tasks: [
      {
        id: "yeonwoo-1",
        title: "프로젝트 계획 수립",
        projectId: "yeonwoo",
        startDate: "2025-07-18",
        endDate: "2025-07-20",
        color: "bg-red-400"
      },
      {
        id: "yeonwoo-2",
        title: "요구사항 분석",
        projectId: "yeonwoo",
        startDate: "2025-07-19",
        endDate: "2025-07-21",
        color: "bg-red-500"
      },
      {
        id: "yeonwoo-3",
        title: "시스템 설계",
        projectId: "yeonwoo",
        startDate: "2025-07-20",
        endDate: "2025-07-22",
        color: "bg-red-600"
      },
      {
        id: "yeonwoo-4",
        title: "개발 작업",
        projectId: "yeonwoo",
        startDate: "2025-07-21",
        endDate: "2025-07-24",
        color: "bg-red-700"
      }
    ]
  },
  {
    id: "netmovage",
    name: "(주)네트모베이지",
    color: "bg-yellow-500",
    expanded: true,
    tasks: [
      {
        id: "net-1",
        title: "인프라 구축",
        projectId: "netmovage",
        startDate: "2025-07-19",
        endDate: "2025-07-21",
        color: "bg-yellow-400"
      },
      {
        id: "net-2",
        title: "보안 설정",
        projectId: "netmovage",
        startDate: "2025-07-20",
        endDate: "2025-07-22",
        color: "bg-yellow-500"
      },
      {
        id: "net-3",
        title: "성능 최적화",
        projectId: "netmovage",
        startDate: "2025-07-22",
        endDate: "2025-07-24",
        color: "bg-yellow-600"
      }
    ]
  },
  {
    id: "cosmoros",
    name: "주식회사 코스모로스",
    color: "bg-cyan-500",
    expanded: true,
    tasks: [
      {
        id: "cos-1",
        title: "기술 검토",
        projectId: "cosmoros",
        startDate: "2025-07-20",
        endDate: "2025-07-22",
        color: "bg-cyan-400"
      },
      {
        id: "cos-2",
        title: "프로토타입 개발",
        projectId: "cosmoros",
        startDate: "2025-07-21",
        endDate: "2025-07-24",
        color: "bg-cyan-500"
      },
      {
        id: "cos-3",
        title: "테스트 및 검증",
        projectId: "cosmoros",
        startDate: "2025-07-24",
        endDate: "2025-07-26",
        color: "bg-cyan-600"
      }
    ]
  }
];

const ganttScrollbarStyles = `
  .gantt-timeline-scroll::-webkit-scrollbar {
    height: 12px;
  }
  .gantt-timeline-scroll::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 6px;
  }
  .gantt-timeline-scroll::-webkit-scrollbar-thumb {
    background: #9ca3af;
    border-radius: 6px;
  }
  .gantt-timeline-scroll::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
`;

const GanttChart = () => {
  const [projects, setProjects] = useState<Project[]>(projectsData);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedTask: null,
    ghostPosition: null,
    hoveredCell: null,
    mouseOffset: { x: 0, y: 0 }
  });
  
  const headerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Calculate total rows
  const totalRows = projects.reduce((sum, project) => {
    return sum + 1 + (project.expanded ? project.tasks.length : 0);
  }, 0);

  // Get today's position
  const getTodayIndex = () => {
    const today = new Date();
    const todayString = dateToString(today);
    return getDateIndex(todayString);
  };

  const todayIndex = getTodayIndex();
  const isToday = todayIndex >= 0 && todayIndex < totalDays;

  // Scroll to today on mount
  useEffect(() => {
    if (isToday && timelineRef.current) {
      const scrollLeft = (todayIndex * CELL_WIDTH) - (timelineRef.current.clientWidth / 2) + (CELL_WIDTH / 2);
      timelineRef.current.scrollLeft = Math.max(0, scrollLeft);
    }
  }, []);

  // Synchronize horizontal scroll between header and timeline
  const handleHeaderScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    if (timelineRef.current) {
      timelineRef.current.scrollLeft = scrollLeft;
    }
  }, []);

  const handleTimelineScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    if (headerRef.current) {
      headerRef.current.scrollLeft = scrollLeft;
    }
  }, []);

  // Get grid cell from mouse position
  const getGridCellFromMouse = useCallback((e: MouseEvent) => {
    if (!gridRef.current || !timelineRef.current) return null;
    
    const gridRect = gridRef.current.getBoundingClientRect();
    const scrollLeft = timelineRef.current.scrollLeft;
    const scrollTop = timelineRef.current.scrollTop;
    
    const x = e.clientX - gridRect.left + scrollLeft;
    const y = e.clientY - gridRect.top + scrollTop;
    
    const col = Math.floor(x / CELL_WIDTH);
    const row = Math.floor(y / CELL_HEIGHT);
    
    console.log('[GANTT] Mouse position:', {
      clientX: e.clientX,
      clientY: e.clientY,
      scrollLeft,
      scrollTop,
      calculatedX: x,
      calculatedY: y,
      col,
      row
    });
    
    // Validate bounds
    if (col < 0 || col >= totalDays || row < 0 || row >= totalRows) {
      console.log('[GANTT] Out of bounds:', { col, row, totalDays, totalRows });
      return null;
    }
    
    // Check if row is a valid task row (not project header)
    let currentRow = 0;
    for (const project of projects) {
      if (currentRow === row) {
        console.log('[GANTT] Project header row:', row);
        return null; // Project header row
      }
      currentRow++;
      if (project.expanded) {
        const taskIndex = row - currentRow;
        if (taskIndex >= 0 && taskIndex < project.tasks.length) {
          console.log('[GANTT] Valid task row:', { row, col, project: project.name });
          return { row, col };
        }
        currentRow += project.tasks.length;
      }
    }
    
    console.log('[GANTT] Invalid row:', row);
    return null;
  }, [projects, totalDays, totalRows]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent, task: Task, taskElement: HTMLDivElement) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = taskElement.getBoundingClientRect();
    const mouseOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    console.log('[GANTT] Drag start:', {
      task: task.title,
      taskId: task.id,
      mouseOffset,
      clientX: e.clientX,
      clientY: e.clientY
    });
    
    setDragState({
      isDragging: true,
      draggedTask: task,
      ghostPosition: { x: e.clientX - mouseOffset.x, y: e.clientY - mouseOffset.y },
      hoveredCell: null,
      mouseOffset
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging) return;
    
    const ghostPosition = {
      x: e.clientX - dragState.mouseOffset.x,
      y: e.clientY - dragState.mouseOffset.y
    };
    
    const hoveredCell = getGridCellFromMouse(e);
    
    console.log('[GANTT] Mouse move:', {
      hoveredCell,
      ghostPosition
    });
    
    setDragState(prev => ({
      ...prev,
      ghostPosition,
      hoveredCell
    }));
  }, [dragState.isDragging, dragState.mouseOffset, getGridCellFromMouse]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.draggedTask) return;
    
    const dropCell = getGridCellFromMouse(e);
    
    console.log('[GANTT] Drop:', {
      dropCell,
      task: dragState.draggedTask.title,
      originalDates: {
        start: dragState.draggedTask.startDate,
        end: dragState.draggedTask.endDate
      }
    });
    
    if (dropCell) {
      const { draggedTask } = dragState;
      const duration = getDuration(draggedTask.startDate, draggedTask.endDate);
      const newStartDate = getDateFromIndex(dropCell.col);
      const newEndDate = getDateFromIndex(dropCell.col + duration - 1);
      
      console.log('[GANTT] New dates:', {
        newStartDate,
        newEndDate,
        duration
      });
      
      setProjects(prevProjects => {
        return prevProjects.map(project => {
          if (project.id === draggedTask.projectId) {
            return {
              ...project,
              tasks: project.tasks.map(task => {
                if (task.id === draggedTask.id) {
                  return {
                    ...task,
                    startDate: newStartDate,
                    endDate: newEndDate
                  };
                }
                return task;
              })
            };
          }
          return project;
        });
      });
    }
    
    setDragState({
      isDragging: false,
      draggedTask: null,
      ghostPosition: null,
      hoveredCell: null,
      mouseOffset: { x: 0, y: 0 }
    });
  }, [dragState, getGridCellFromMouse]);

  // Add global mouse event listeners
  useEffect(() => {
    if (dragState.isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
      const handleGlobalMouseUp = (e: MouseEvent) => handleMouseUp(e);
      
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  // Toggle project expansion
  const toggleProject = (projectId: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, expanded: !p.expanded } : p
    ));
  };

  // Render grid cells
  const renderGridCells = () => {
    const cells = [];
    
    for (let row = 0; row < totalRows; row++) {
      for (let col = 0; col < totalDays; col++) {
        const isWeekend = (col + 1) % 7 === 0 || (col + 2) % 7 === 0;
        const isTodayColumn = col === todayIndex;
        const isHovered = dragState.hoveredCell?.row === row && dragState.hoveredCell?.col === col;
        
        cells.push(
          <div
            key={`${row}-${col}`}
            className={`absolute border-r border-b border-gray-200 transition-colors ${
              isWeekend ? 'bg-gray-50' : 'bg-white'
            } ${isTodayColumn ? 'bg-red-50' : ''} ${
              isHovered && dragState.isDragging ? 'bg-blue-100 border-blue-400' : ''
            }`}
            style={{
              left: col * CELL_WIDTH,
              top: row * CELL_HEIGHT,
              width: CELL_WIDTH,
              height: CELL_HEIGHT
            }}
          />
        );
      }
    }
    
    return cells;
  };

  // Render tasks
  const renderTasks = () => {
    const elements: JSX.Element[] = [];
    let currentRow = 0;
    
    projects.forEach((project) => {
      // Project header
      elements.push(
        <div
          key={`project-${project.id}`}
          className={`absolute flex items-center px-2 font-medium text-sm ${project.color} text-white cursor-pointer`}
          style={{
            left: 0,
            top: currentRow * CELL_HEIGHT,
            width: totalDays * CELL_WIDTH,
            height: CELL_HEIGHT
          }}
          onClick={() => toggleProject(project.id)}
        >
          <span className="mr-2">{project.expanded ? '▼' : '▶'}</span>
          {project.name}
        </div>
      );
      currentRow++;
      
      // Tasks
      if (project.expanded) {
        project.tasks.forEach((task) => {
          const taskRow = currentRow;
          const startCol = getDateIndex(task.startDate);
          const duration = getDuration(task.startDate, task.endDate);
          const isDragging = dragState.isDragging && dragState.draggedTask?.id === task.id;
          
          // Render task (hide if being dragged)
          elements.push(
            <div
              key={`task-${task.id}`}
              className={`absolute flex items-center px-2 text-xs text-white rounded shadow-sm cursor-move ${
                task.color
              } ${isDragging ? 'opacity-0' : 'hover:opacity-90'}`}
              style={{
                left: startCol * CELL_WIDTH + 2,
                top: taskRow * CELL_HEIGHT + 4,
                width: duration * CELL_WIDTH - 4,
                height: CELL_HEIGHT - 8
              }}
              onMouseDown={(e) => handleMouseDown(e, task, e.currentTarget)}
            >
              <span className="truncate">{task.title}</span>
            </div>
          );
          
          currentRow++;
        });
      }
    });
    
    return elements;
  };

  // Render preview indicator
  const renderPreviewIndicator = () => {
    if (!dragState.isDragging || !dragState.draggedTask || !dragState.hoveredCell) return null;
    
    const duration = getDuration(dragState.draggedTask.startDate, dragState.draggedTask.endDate);
    const { row, col } = dragState.hoveredCell;
    
    return (
      <div
        className={`absolute ${dragState.draggedTask.color} rounded shadow-lg opacity-60 pointer-events-none z-50`}
        style={{
          left: col * CELL_WIDTH + 2,
          top: row * CELL_HEIGHT + 4,
          width: duration * CELL_WIDTH - 4,
          height: CELL_HEIGHT - 8
        }}
      >
        <div className="flex items-center px-2 text-xs text-white h-full">
          <span className="truncate">{dragState.draggedTask.title}</span>
        </div>
      </div>
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ganttScrollbarStyles }} />
      <div className="bg-white h-screen flex flex-col relative">
        {/* Drag ghost (follows mouse) */}
      {dragState.isDragging && dragState.draggedTask && dragState.ghostPosition && (
        <div
          className={`fixed ${dragState.draggedTask.color} rounded shadow-2xl pointer-events-none z-[100] opacity-80`}
          style={{
            left: dragState.ghostPosition.x,
            top: dragState.ghostPosition.y,
            width: getDuration(dragState.draggedTask.startDate, dragState.draggedTask.endDate) * CELL_WIDTH - 4,
            height: CELL_HEIGHT - 8
          }}
        >
          <div className="flex items-center px-2 text-xs text-white h-full">
            <span className="truncate">{dragState.draggedTask.title}</span>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex bg-gray-50 border-b border-gray-300">
        {/* Project column header */}
        <div className="w-48 flex-shrink-0 px-4 py-2 border-r border-gray-300">
          <h3 className="font-semibold text-sm">프로젝트 / 작업</h3>
        </div>
        
        {/* Date headers */}
        <div 
          ref={headerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-none"
          onScroll={handleHeaderScroll}
          style={{ height: HEADER_HEIGHT }}
        >
          <div className="relative" style={{ width: totalDays * CELL_WIDTH, height: HEADER_HEIGHT }}>
            {/* Month row */}
            <div className="absolute top-0 left-0 right-0 h-8 flex border-b border-gray-200">
              {(() => {
                const months: JSX.Element[] = [];
                let currentMonth = -1;
                let monthStart = 0;
                let monthDays = 0;
                
                for (let i = 0; i < totalDays; i++) {
                  const date = new Date(baseDate);
                  date.setDate(date.getDate() + i);
                  const month = date.getMonth();
                  
                  if (month !== currentMonth) {
                    if (currentMonth !== -1) {
                      months.push(
                        <div
                          key={`month-${currentMonth}`}
                          className="border-r border-gray-300 flex items-center justify-center text-sm font-medium"
                          style={{ 
                            position: 'absolute',
                            left: monthStart * CELL_WIDTH,
                            width: monthDays * CELL_WIDTH
                          }}
                        >
                          {new Date(2025, currentMonth).toLocaleString('ko-KR', { month: 'long' })}
                        </div>
                      );
                    }
                    currentMonth = month;
                    monthStart = i;
                    monthDays = 0;
                  }
                  monthDays++;
                }
                
                // Add last month
                if (monthDays > 0) {
                  months.push(
                    <div
                      key={`month-${currentMonth}`}
                      className="border-r border-gray-300 flex items-center justify-center text-sm font-medium"
                      style={{ 
                        position: 'absolute',
                        left: monthStart * CELL_WIDTH,
                        width: monthDays * CELL_WIDTH
                      }}
                    >
                      {new Date(2025, currentMonth).toLocaleString('ko-KR', { month: 'long' })}
                    </div>
                  );
                }
                
                return months;
              })()}
            </div>
            
            {/* Date row */}
            <div className="absolute top-8 left-0 right-0 flex">
              {Array.from({ length: totalDays }, (_, i) => {
                const date = new Date(baseDate);
                date.setDate(date.getDate() + i);
                const day = date.getDate();
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const isTodayColumn = i === todayIndex;
                
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-center text-xs border-r border-gray-200 ${
                      isWeekend ? 'bg-gray-100' : ''
                    } ${isTodayColumn ? 'bg-red-100 font-bold text-red-600' : ''}`}
                    style={{ width: CELL_WIDTH, height: HEADER_HEIGHT - 32 }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            
            {/* Today line in header */}
            {isToday && (
              <div
                className="absolute top-0 w-0.5 bg-red-500 z-20"
                style={{ 
                  left: todayIndex * CELL_WIDTH + CELL_WIDTH / 2,
                  height: HEADER_HEIGHT
                }}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Project names column */}
        <div className="w-48 flex-shrink-0 border-r border-gray-300 overflow-y-hidden bg-gray-50">
          {(() => {
            const rows: JSX.Element[] = [];
            let currentRow = 0;
            
            projects.forEach(project => {
              // Project header
              rows.push(
                <div
                  key={`sidebar-project-${project.id}`}
                  className="h-10 flex items-center px-4 border-b border-gray-200 font-medium text-sm cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleProject(project.id)}
                >
                  <span className="mr-2">{project.expanded ? '▼' : '▶'}</span>
                  {project.name}
                </div>
              );
              
              // Tasks
              if (project.expanded) {
                project.tasks.forEach(task => {
                  rows.push(
                    <div
                      key={`sidebar-task-${task.id}`}
                      className="h-10 flex items-center px-6 border-b border-gray-200 text-sm hover:bg-gray-100"
                    >
                      {task.title}
                    </div>
                  );
                });
              }
            });
            
            return rows;
          })()}
        </div>
        
        {/* Timeline grid */}
        <div 
          ref={timelineRef}
          className="flex-1 relative gantt-timeline-scroll"
          style={{ 
            overflowX: 'scroll',
            overflowY: 'hidden',
            scrollbarWidth: 'auto',
            scrollbarColor: '#9CA3AF #F3F4F6'
          }}
          onScroll={handleTimelineScroll}
        >
          <div 
            ref={gridRef}
            className="relative"
            style={{ 
              width: totalDays * CELL_WIDTH,
              height: totalRows * CELL_HEIGHT
            }}
          >
            {/* Grid cells */}
            {renderGridCells()}
            
            {/* Preview indicator */}
            {renderPreviewIndicator()}
            
            {/* Today line */}
            {isToday && (
              <div
                className="absolute top-0 w-0.5 bg-red-500 z-10"
                style={{ 
                  left: todayIndex * CELL_WIDTH + CELL_WIDTH / 2,
                  height: totalRows * CELL_HEIGHT
                }}
              >
                <div className="absolute -top-6 -left-8 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  오늘
                </div>
              </div>
            )}
            
            {/* Tasks */}
            {renderTasks()}
          </div>
        </div>
      </div>
      
      {/* Status bar */}
      <div className="h-8 bg-gray-100 border-t border-gray-300 px-4 flex items-center justify-between text-xs text-gray-600">
        <div className="flex gap-4">
          <span>총 {projects.length}개 프로젝트</span>
          <span>총 {projects.reduce((sum, p) => sum + p.tasks.length, 0)}개 작업</span>
        </div>
        <div className="flex gap-4">
          {isToday && <span className="text-red-600">오늘: {getDateFromIndex(todayIndex)}</span>}
          <span>기간: {dateToString(baseDate)} ~ {dateToString(endDate)}</span>
        </div>
      </div>
    </div>
    </>
  );
};

export default GanttChart;