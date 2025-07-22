import React from 'react';
import type { Participant, Task } from '../../../types/schedule';
import { getProjectRowCount } from '../../../utils/taskUtils';
import ProjectHeader from './ProjectHeader';
import AddFactoryRow from './AddFactoryRow';

interface ScheduleProjectColumnProps {
  projects: Participant[];
  tasks: Task[];
  selectedProjects: string[];
  draggedProjectIndex: number | null;
  dragOverProjectIndex: number | null;
  modalState: any;
  setModalState: any;
  onProjectSelect: (projectId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
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
  onSelectAll,
  onDeleteProject,
  onProjectDragStart,
  onProjectDragEnd,
  onProjectDrop,
  onProjectMouseDown,
  onProjectMouseEnter,
  onAddFactory,
  isDragSelecting
}) => {
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
    <div className="w-72 bg-white flex-shrink-0 relative" style={{ zIndex: 10000 }}>
      {/* Combined header - matching timeline header total height (24px + 28px + 1px border) */}
      <div className="border-b border-gray-200 border-r border-gray-100 bg-gray-50/50 flex items-center justify-center" style={{ height: '53px' }}>
        <span className="text-xs font-medium text-gray-600">공장</span>
      </div>
      
      {/* Project names with right border only for actual projects */}
      <div className="border-r border-gray-100">
        {projects.map((project, index) => {
        if (!project) return null;
        
        const rowCount = getProjectRowCount(project.id, tasks);
        const projectHeight = Math.max(50, rowCount * 40 + 20);
        
        return (
          <div key={project.id} 
            onDragOver={(e) => {
              e.preventDefault();
              if (modalState.draggedProjectIndex !== null && modalState.draggedProjectIndex !== index) {
                setModalState((prev: any) => ({ ...prev, dragOverProjectIndex: index }));
              }
            }}
            onDragLeave={() => {
              setModalState((prev: any) => ({ ...prev, dragOverProjectIndex: null }));
            }}
            onDrop={(e) => onProjectDrop(e, index)}
            onMouseDown={() => onProjectMouseDown(index)}
            onMouseEnter={() => onProjectMouseEnter(index)}
          >
            <ProjectHeader
              project={project}
              index={index}
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
      
      {/* Add Factory Row - without right border */}
      <AddFactoryRow 
        key={addFactoryProject.id} 
        height={50} 
        onAddFactory={onAddFactory} 
      />
      
      {/* 공장 추가 행 아래 경계선 - 오른쪽 경계선 없음 */}
      <div className="border-b border-gray-200" style={{ height: '1px' }}></div>
    </div>
  );
};

export default ScheduleProjectColumn;