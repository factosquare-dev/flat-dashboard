import React, { useState, useRef, useCallback, useMemo } from 'react';
import type { Task } from '@/shared/types/schedule';
import { FactoryType, TaskStatus } from '@/shared/types/enums';
import GanttHeader from '@/modules/schedule/GanttHeader';
import GanttGrid from '@/modules/schedule/GanttGrid';
import { useGanttDrag } from '@/modules/schedule/hooks/useGanttDrag';
import type { Project } from '@/GanttChart/types';
import { GANTT_CONSTANTS, getTotalDays, getGanttDateRange } from '@/modules/schedule/constants';

interface TaskCentricGanttChartProps {
  tasks: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

// Define the three swimlanes
const SWIMLANES = [
  { id: 'manufacturer', label: '제조', type: FactoryType.MANUFACTURER, color: 'bg-blue-500' },
  { id: 'container', label: '용기', type: FactoryType.CONTAINER, color: 'bg-green-500' },
  { id: 'packaging', label: '포장', type: FactoryType.PACKAGING, color: 'bg-purple-500' },
] as const;

// Scrollbar styles
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

const TaskCentricGanttChart: React.FC<TaskCentricGanttChartProps> = ({
  tasks,
  onTaskUpdate
}) => {
  // Group tasks by factory type
  const tasksByType = useMemo(() => {
    const grouped: Record<string, Task[]> = {
      manufacturer: [],
      container: [],
      packaging: [],
    };

    // Get the date range for filtering
    const { baseDate, endDate } = getGanttDateRange();
    const baseDateStr = baseDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    tasks.forEach(task => {
      // Check if task is within the visible date range
      const taskStartDate = typeof task.startDate === 'string' ? task.startDate : task.startDate.toISOString().split('T')[0];
      const taskEndDate = typeof task.endDate === 'string' ? task.endDate : task.endDate.toISOString().split('T')[0];
      
      if (taskEndDate < baseDateStr || taskStartDate > endDateStr) {
        return; // Skip tasks outside the visible range
      }

      // Group by factory type from factoryAssignments
      task.factoryAssignments?.forEach(assignment => {
        if (assignment.factoryType === FactoryType.MANUFACTURER) {
          grouped.manufacturer.push({
            ...task,
            // Override dates with factory-specific dates if available
            startDate: assignment.startDate || task.startDate,
            endDate: assignment.endDate || task.endDate,
            // Add factory info to task
            factoryId: assignment.factoryId,
            factoryName: assignment.factoryName,
          } as Task);
        } else if (assignment.factoryType === FactoryType.CONTAINER) {
          grouped.container.push({
            ...task,
            startDate: assignment.startDate || task.startDate,
            endDate: assignment.endDate || task.endDate,
            factoryId: assignment.factoryId,
            factoryName: assignment.factoryName,
          } as Task);
        } else if (assignment.factoryType === FactoryType.PACKAGING) {
          grouped.packaging.push({
            ...task,
            startDate: assignment.startDate || task.startDate,
            endDate: assignment.endDate || task.endDate,
            factoryId: assignment.factoryId,
            factoryName: assignment.factoryName,
          } as Task);
        }
      });
    });

    // Sort tasks by start date within each group
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => {
        const aStart = typeof a.startDate === 'string' ? a.startDate : a.startDate.toISOString();
        const bStart = typeof b.startDate === 'string' ? b.startDate : b.startDate.toISOString();
        return aStart.localeCompare(bStart);
      });
    });

    return grouped;
  }, [tasks]);

  // Convert to Project format for compatibility with existing Gantt components
  const projects = useMemo<Project[]>(() => {
    return SWIMLANES.map(swimlane => ({
      id: swimlane.id,
      name: swimlane.label,
      color: swimlane.color,
      expanded: true, // Always expanded for swimlanes
      tasks: tasksByType[swimlane.id].map(task => ({
        id: task.id,
        title: `${task.title || task.name || '작업'} (${task.factoryName || '공장'})`,
        projectId: swimlane.id,
        startDate: typeof task.startDate === 'string' ? task.startDate : task.startDate.toISOString().split('T')[0],
        endDate: typeof task.endDate === 'string' ? task.endDate : task.endDate.toISOString().split('T')[0],
        status: task.status || TaskStatus.PENDING,
        progress: task.progress || 0
      }))
    }));
  }, [tasksByType]);

  // Handle drag operations
  const handleProjectsUpdate = useCallback((updatedProjects: Project[]) => {
    // Extract task updates and call onTaskUpdate
    updatedProjects.forEach(project => {
      project.tasks.forEach(task => {
        const originalTask = tasks.find(t => t.id === task.id);
        if (originalTask && 
            (originalTask.startDate !== task.startDate || 
             originalTask.endDate !== task.endDate)) {
          onTaskUpdate?.(task.id, {
            startDate: task.startDate,
            endDate: task.endDate
          });
        }
      });
    });
  }, [tasks, onTaskUpdate]);

  // Use custom hook for drag and drop
  const { dragState, handleMouseDown, handleMouseMove, handleMouseUp } = useGanttDrag({
    projects,
    setProjects: handleProjectsUpdate
  });

  // Refs for scroll synchronization
  const headerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Calculate dimensions
  const totalRows = SWIMLANES.length; // Always 3 rows
  const totalDays = useMemo(() => getTotalDays(), []);

  // Synchronize horizontal scroll between header and timeline
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    
    if (headerRef.current) {
      headerRef.current.scrollLeft = scrollLeft;
    }
  }, []);

  return (
    <div className="w-full h-full bg-white border border-gray-300 rounded-lg overflow-hidden">
      {/* Inject scrollbar styles */}
      <style>{ganttScrollbarStyles}</style>
      
      {/* Header */}
      <div className="flex border-b border-gray-300">
        <div className="w-48 px-4 py-2 bg-gray-50 border-r border-gray-300">
          <span className="text-sm font-medium text-gray-700">작업 유형</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <GanttHeader headerRef={headerRef} />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex h-full">
        {/* Swimlane labels */}
        <div className="w-48 border-r border-gray-300 bg-gray-50">
          {SWIMLANES.map((swimlane, index) => (
            <div
              key={swimlane.id}
              className="h-20 px-4 flex items-center border-b border-gray-200"
              style={{ height: GANTT_CONSTANTS.CELL_HEIGHT }}
            >
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${swimlane.color}`} />
                <span className="text-sm font-medium text-gray-700">{swimlane.label}</span>
                <span className="text-xs text-gray-500">({tasksByType[swimlane.id].length})</span>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline area */}
        <div 
          className="flex-1 overflow-auto gantt-timeline-scroll relative"
          ref={timelineRef}
          onScroll={handleScroll}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ cursor: dragState.isDragging ? 'grabbing' : 'default' }}
        >
          <div
            className="relative"
            style={{
              width: totalDays * GANTT_CONSTANTS.CELL_WIDTH,
              height: totalRows * GANTT_CONSTANTS.CELL_HEIGHT,
              minHeight: '240px' // 3 rows * 80px
            }}
          >
            {/* Grid background */}
            <GanttGrid 
              totalRows={totalRows}
              dragState={dragState}
            />

            {/* Render tasks for each swimlane */}
            {projects.map((project, projectIndex) => {
              const y = projectIndex * GANTT_CONSTANTS.CELL_HEIGHT;
              
              return (
                <div key={project.id}>
                  {/* Render tasks */}
                  {project.tasks.map(task => {
                    // Calculate task position
                    const { baseDate } = getGanttDateRange();
                    const taskStart = new Date(task.startDate);
                    const taskEnd = new Date(task.endDate);
                    const startDays = Math.floor((taskStart.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
                    const duration = Math.floor((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    
                    const x = startDays * GANTT_CONSTANTS.CELL_WIDTH;
                    const width = duration * GANTT_CONSTANTS.CELL_WIDTH;

                    return (
                      <div
                        key={task.id}
                        className={`absolute flex items-center px-2 rounded shadow-sm border border-gray-300 ${project.color} text-white cursor-move hover:shadow-md transition-shadow`}
                        style={{
                          left: `${x}px`,
                          top: `${y + 10}px`,
                          width: `${width}px`,
                          height: `${GANTT_CONSTANTS.CELL_HEIGHT - 20}px`,
                          minWidth: '50px'
                        }}
                        onMouseDown={(e) => handleMouseDown(e, task, project.id)}
                        title={task.title}
                      >
                        <span className="text-xs font-medium truncate">{task.title}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCentricGanttChart;