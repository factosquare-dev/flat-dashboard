import React from 'react';
import GridCell from '../GridCell';
import { formatDateISO } from '@/utils/coreUtils';
import { getInteractionState } from '../../utils/globalState';
import './ProjectRowGrid.css';

interface ProjectRowGridProps {
  days: Date[];
  cellWidth: number;
  projectId: string;
  isAddFactoryRow: boolean;
  modalState: {
    isResizingTask?: boolean;
    isDraggingTask?: boolean;
  };
  onGridClick: (e: React.MouseEvent, projectId: string, date: string) => void;
}

export const ProjectRowGrid: React.FC<ProjectRowGridProps> = React.memo(({
  days,
  cellWidth,
  projectId,
  isAddFactoryRow,
  modalState,
  onGridClick,
}) => {
  const handleCellClick = React.useCallback((e: React.MouseEvent, day: Date) => {
    // Check if click target is the cell itself
    if (e.target !== e.currentTarget) {
      return;
    }
    
    // Check global interaction state
    const state = getInteractionState();
    if (state.mode !== 'idle' || Date.now() < state.preventClickUntil) {
      return;
    }
    
    // Additional safety check
    if (modalState.isResizingTask || modalState.isDraggingTask) {
      return;
    }
    
    const clickedDate = formatDateISO(day);
    onGridClick(e, projectId, clickedDate);
  }, [modalState.isResizingTask, modalState.isDraggingTask, onGridClick, projectId]);

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="project-row-grid">
      {days.map((day, dayIndex) => (
        <GridCell
          key={dayIndex}
          day={day}
          cellWidth={cellWidth}
          projectId={projectId}
          isAddFactoryRow={isAddFactoryRow}
          onClick={!isAddFactoryRow ? (e) => handleCellClick(e, day) : undefined}
          onDragOver={!isAddFactoryRow ? handleDragOver : undefined}
          onDragLeave={!isAddFactoryRow ? () => {
            // No cleanup needed
          } : undefined}
          onDrop={!isAddFactoryRow ? (e) => {
            // Drop is handled at parent level
            e.preventDefault();
            e.stopPropagation();
          } : undefined}
        />
      ))}
    </div>
  );
});