import React, { useState, useRef, useCallback, useMemo } from 'react';
import type { Participant, Task } from '../../../types/schedule';
import GanttHeader from '../../GanttChart/GanttHeader';
import ProjectSidebar from '../../GanttChart/ProjectSidebar';
import GanttGrid from '../../GanttChart/GanttGrid';
import TaskRenderer from '../../GanttChart/TaskRenderer';
import { useGanttDrag } from '../../GanttChart/hooks/useGanttDrag';
import type { Project } from '../../GanttChart/types';
import { getTotalRows } from '../../GanttChart/utils/ganttHelpers';
import { GANTT_CONSTANTS, getTotalDays } from '../../GanttChart/constants';

interface IntegratedGanttChartProps {
  participants: Participant[];
  tasks: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onTaskCreate?: (task: Omit<Task, 'id'>) => void;
  onTaskDelete?: (taskId: string) => void;
  onProjectDelete?: (projectId: string) => void;
  onProjectToggle?: (projectId: string) => void;
}

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

const IntegratedGanttChart: React.FC<IntegratedGanttChartProps> = ({
  participants,
  tasks,
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete,
  onProjectDelete,
  onProjectToggle
}) => {
  // Convert participants and tasks to GanttChart's Project format
  const projects = useMemo<Project[]>(() => {
    const colorMap = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-cyan-500'];
    
    return participants.map((participant, index) => {
      // Get tasks for this participant - 오직 factoryId로만 매칭 (가장 안전)
      const projectTasks = tasks
        .filter(task => task.factoryId === participant.id)
        .map(task => ({
          id: task.id,
          title: task.title || task.taskType || '태스크',
          projectId: participant.id,
          startDate: typeof task.startDate === 'string' ? task.startDate : task.startDate.toISOString().split('T')[0],
          endDate: typeof task.endDate === 'string' ? task.endDate : task.endDate.toISOString().split('T')[0],
          status: task.status || 'pending',
          progress: task.progress || 0
        }));

      return {
        id: participant.id,
        name: participant.name,
        color: participant.color || colorMap[index % 5],
        expanded: false,
        tasks: projectTasks
      };
    });
  }, [participants, tasks]);

  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  // Update projects with expanded state
  const projectsWithExpanded = useMemo(() => {
    return projects.map(project => ({
      ...project,
      expanded: expandedProjects.has(project.id)
    }));
  }, [projects, expandedProjects]);

  const toggleProject = useCallback((projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
    onProjectToggle?.(projectId);
  }, [onProjectToggle]);

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
    projects: projectsWithExpanded,
    setProjects: handleProjectsUpdate
  });

  // Refs for scroll synchronization
  const headerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Calculate total rows for grid
  const totalRows = useMemo(() => getTotalRows(projectsWithExpanded), [projectsWithExpanded]);
  
  // Calculate total days dynamically
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
        <GanttHeader headerRef={headerRef} />
      </div>

      {/* Main content area */}
      <div className="flex h-full">
        {/* Project sidebar */}
        <ProjectSidebar 
          projects={projectsWithExpanded} 
          onToggleProject={toggleProject}
        />

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
            ref={gridRef}
            className="relative"
            style={{
              width: totalDays * GANTT_CONSTANTS.CELL_WIDTH,
              height: totalRows * GANTT_CONSTANTS.CELL_HEIGHT,
              minHeight: '400px'
            }}
          >
            {/* Grid background */}
            <GanttGrid 
              totalRows={totalRows}
              dragState={dragState}
            />

            {/* Tasks and project headers */}
            <TaskRenderer
              projects={projectsWithExpanded}
              dragState={dragState}
              onToggleProject={toggleProject}
              onMouseDown={handleMouseDown}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegratedGanttChart;