import React from 'react';
import type { Participant, Task } from '../../../types/schedule';
import { getProjectRowCount } from '@/utils/taskUtils';
import ProjectHeader from './ProjectHeader';
import AddFactoryRow from './AddFactoryRow';

interface ScheduleProjectColumnProps {
  projects: Participant[];
  tasks: Task[];
  selectedProjects: string[];
  draggedProjectIndex: number | null;
  dragOverProjectIndex: number | null;
  modalState: {
    draggedProjectIndex?: number | null;
    dragOverProjectIndex?: number | null;
  };
  setModalState: React.Dispatch<React.SetStateAction<{
    draggedProjectIndex?: number | null;
    dragOverProjectIndex?: number | null;
  }>>;
  onProjectSelect: (projectId: string, checked: boolean) => void;
  onDeleteProject: (projectId: string) => void;
  onProjectDragStart: (e: React.DragEvent, index: number) => void;
  onProjectDragEnd: () => void;
  onProjectDrop: (e: React.DragEvent, index: number) => void;
  onProjectMouseDown: (index: number) => void;
  onProjectMouseEnter: (index: number) => void;
  onAddFactory?: () => void;
  isDragSelecting?: boolean;
}

const ScheduleProjectColumn: React.FC<ScheduleProjectColumnProps> = ({
  projects,
  tasks,
  selectedProjects,
  draggedProjectIndex,
  dragOverProjectIndex,
  modalState,
  setModalState,
  onProjectSelect,
  onDeleteProject,
  onProjectDragStart,
  onProjectDragEnd,
  onProjectDrop,
  onProjectMouseDown,
  onProjectMouseEnter,
  onAddFactory,
  isDragSelecting
}) => {
  return (
    <div className="w-72 bg-white flex-shrink-0 relative" style={{ zIndex: 10000 }}>
      {/* Combined header - matching timeline header total height (24px + 28px + 1px border) */}
      <div className="border-b border-gray-200 border-r border-gray-100 bg-gray-50/50 flex items-center justify-center" style={{ height: '53px' }}>
        <span className="text-xs font-medium text-gray-600">공장</span>
      </div>
      
      {/* Project names - all projects including "Add Factory" */}
      <div className="border-r border-gray-100">
        {projects.map((project, index) => {
          if (!project) return null;
          
          const isAddFactoryRow = project.id === 'ADD_FACTORY_ROW';
          
          if (isAddFactoryRow) {
            // Render Add Factory Row
            return (
              <AddFactoryRow 
                key={project.id} 
                height={50} 
                onAddFactory={onAddFactory} 
              />
            );
          }
          
          // Regular project row
          const rowCount = getProjectRowCount(project.id, tasks, project.name);
          const projectHeight = Math.max(50, rowCount * 40 + 20);
          
          return (
            <div key={project.id} 
              onDragOver={(e) => {
                e.preventDefault();
                if (modalState.draggedProjectIndex !== null && modalState.draggedProjectIndex !== index) {
                  setModalState(prev => ({ ...prev, dragOverProjectIndex: index }));
                }
              }}
              onDragLeave={() => {
                setModalState(prev => ({ ...prev, dragOverProjectIndex: null }));
              }}
              onDrop={(e) => onProjectDrop(e, index)}
              onMouseDown={() => onProjectMouseDown(index)}
              onMouseEnter={() => onProjectMouseEnter(index)}
            >
              <ProjectHeader
                project={project}
                isSelected={selectedProjects.includes(project.id)}
                isDragging={draggedProjectIndex === index}
                isDropTarget={dragOverProjectIndex === index}
                projectHeight={projectHeight}
                onCheckboxChange={(checked) => onProjectSelect(project.id, checked)}
                onDragStart={(e) => onProjectDragStart(e, index)}
                onDragEnd={onProjectDragEnd}
                onDelete={() => onDeleteProject(project.id)}
                onMouseEnter={() => onProjectMouseEnter(index)}
                onCheckboxMouseDown={() => onProjectMouseDown(index)}
                isDragSelecting={isDragSelecting}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduleProjectColumn;