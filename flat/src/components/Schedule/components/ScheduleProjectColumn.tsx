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
  onAddFactory
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
    <div className="w-72 bg-white border-r border-gray-100 flex-shrink-0">
      {/* Combined header - matching timeline header total height (24px + 28px + 1px border) */}
      <div className="border-b border-gray-200 bg-gray-50/50 flex items-center justify-center" style={{ height: '53px' }}>
        <span className="text-xs font-medium text-gray-600">공장</span>
      </div>
      
      {/* Project names */}
      {allRows.map((project, index) => {
        const isAddFactoryRow = project.id === 'ADD_FACTORY_ROW_ID';
        const rowCount = isAddFactoryRow ? 1 : getProjectRowCount(project.id, tasks);
        const projectHeight = isAddFactoryRow ? 50 : Math.max(50, rowCount * 40 + 20);
        
        if (isAddFactoryRow) {
          return <AddFactoryRow key={project.id} height={projectHeight} onAddFactory={onAddFactory} />;
        }
        
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
              onDragStart={onProjectDragStart}
              onDragEnd={onProjectDragEnd}
              onDelete={() => onDeleteProject(project.id)}
              onMouseEnter={() => onProjectMouseEnter(index)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ScheduleProjectColumn;