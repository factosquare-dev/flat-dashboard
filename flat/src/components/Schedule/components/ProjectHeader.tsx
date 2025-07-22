import React from 'react';
import type { Participant } from '../../../types/schedule';

interface ProjectHeaderProps {
  project: Participant;
  index: number;
  isSelected: boolean;
  isDragging: boolean;
  isDropTarget: boolean;
  projectHeight: number;
  onCheckboxChange: (checked: boolean) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDelete: () => void;
  onMouseEnter: () => void;
  onCheckboxMouseDown?: () => void;
  isDragSelecting?: boolean;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  index,
  isSelected,
  isDragging,
  isDropTarget,
  projectHeight,
  onCheckboxChange,
  onDragStart,
  onDragEnd,
  onDelete,
  onMouseEnter,
  onCheckboxMouseDown,
  isDragSelecting
}) => {
  return (
    <div
      className={`border-b border-gray-100 flex items-center transition-all hover:bg-gray-50/50 ${
        isDropTarget ? 'bg-blue-50/50' : ''
      } ${isDragging ? 'opacity-50' : ''}`}
      style={{ 
        height: `${projectHeight}px`, 
        minHeight: '50px',
        zIndex: 10000, // 최상위 레이어 - 미리보기보다 위에
        position: 'relative'
      }}
    >
      <div 
        className="flex items-center px-4 py-2 w-full select-none"
      >
        <div 
          className="flex items-center mr-2 p-1"
          onMouseEnter={onMouseEnter}
        >
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            checked={isSelected}
            onChange={(e) => onCheckboxChange(e.target.checked)}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              if (onCheckboxMouseDown) {
                onCheckboxMouseDown();
              }
            }}
            onMouseEnter={(e) => {
              if (isDragSelecting && e.buttons === 1) {
                e.stopPropagation();
              }
            }}
            style={{ userSelect: 'none' }}
          />
        </div>
        <div
          className={`flex-1 cursor-move py-1.5 px-2 transition-all group ${
            isSelected ? 'bg-blue-50' : ''
          }`}
          draggable
          onDragStart={(e) => {
            e.stopPropagation();
            onDragStart(e);
          }}
          onDragEnd={onDragEnd}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-1 h-6 rounded-full flex-shrink-0" 
              style={{ backgroundColor: project.color }}
            />
            <div>
              <div className="font-medium text-xs text-gray-900">{project.name}</div>
              <div className="text-[10px] text-gray-500">
                {project.period ? project.period.replace(/\d{4}/g, (year) => year.slice(2)) : ''}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={onDelete}
          className="ml-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
          title="프로젝트 삭제"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProjectHeader;