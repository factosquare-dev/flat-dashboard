/**
 * GanttChart - Main component for displaying project timelines
 * Refactored from monolithic component into focused sub-components
 */

import React, { useRef, useCallback, useMemo } from 'react';
import GanttHeader from './GanttChart/GanttHeader';
import ProjectSidebar from './GanttChart/ProjectSidebar';
import GanttGrid from './GanttChart/GanttGrid';
import TaskRenderer from './GanttChart/TaskRenderer';
import { useGanttDrag } from './GanttChart/hooks/useGanttDrag';
import { useGanttData } from '@/../hooks/useGanttData';
import { getTotalRows } from './GanttChart/utils/ganttHelpers';
import { GANTT_CONSTANTS, getTotalDays } from './GanttChart/constants';
import './GanttChart.css';

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

const GanttChart: React.FC = () => {
  // Use custom hook for data management
  const { projects, setProjects, toggleProject } = useGanttData();
  
  // Use custom hook for drag and drop
  const { dragState, handleMouseDown, handleMouseMove, handleMouseUp } = useGanttDrag({
    projects,
    setProjects
  });

  // Refs for scroll synchronization
  const headerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Calculate total rows for grid
  const totalRows = useMemo(() => getTotalRows(projects), [projects]);
  
  // Calculate total days dynamically from MockDB projects
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
          projects={projects} 
          onToggleProject={toggleProject}
        />

        {/* Timeline area */}
        <div 
          className="flex-1 overflow-auto gantt-timeline-scroll relative"
          ref={timelineRef}
          onScroll={handleScroll}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          data-dragging={dragState.isDragging}
        >
          <div
            ref={gridRef}
            className="gantt-grid-container"
            data-grid="true"
            style={{
              '--total-days': totalDays,
              '--total-rows': totalRows,
              '--cell-width': `${GANTT_CONSTANTS.CELL_WIDTH}px`,
              '--cell-height': `${GANTT_CONSTANTS.CELL_HEIGHT}px`
            } as React.CSSProperties}
          >
            {/* Grid background */}
            <GanttGrid 
              totalRows={totalRows}
              dragState={dragState}
            />

            {/* Tasks and project headers */}
            <TaskRenderer
              projects={projects}
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

export default GanttChart;