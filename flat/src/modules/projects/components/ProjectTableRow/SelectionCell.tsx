import React from 'react';
import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react';
import type { Project } from '@/shared/types/project';
import { ProjectType } from '@/shared/types/enums';
import { isProjectType } from '@/shared/utils/projectTypeUtils';

interface SelectionCellProps {
  project: Project;
  isExpanded: boolean;
  isSelected: boolean;
  isDragging?: boolean;
  index?: number;
  onSelect: (checked: boolean) => void;
  onStartDrag?: (index: number) => void;
  handleToggleTasks: (e: React.MouseEvent) => void;
  handleMasterToggle: (e: React.MouseEvent) => void;
  isChildOfMaster?: boolean;
  level?: number;
}

const SelectionCell: React.FC<SelectionCellProps> = ({
  project,
  isExpanded,
  isSelected,
  isDragging,
  index,
  onSelect,
  onStartDrag,
  handleToggleTasks,
  handleMasterToggle,
  isChildOfMaster = false,
  level = 0
}) => {
  // Early return if project is undefined
  if (!project) {
    return <div className="px-2 py-3 w-10"></div>;
  }

  return (
    <div 
      className="px-1 py-1.5" 
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => {
        // Master 프로젝트에서는 모든 마우스 이벤트 차단
        if (isProjectType(project.type, ProjectType.MASTER)) {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
      onMouseUp={(e) => {
        if (isProjectType(project.type, ProjectType.MASTER)) {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
      onMouseMove={(e) => {
        if (isProjectType(project.type, ProjectType.MASTER)) {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
      onMouseEnter={(e) => {
        if (isProjectType(project.type, ProjectType.MASTER)) {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
      onMouseLeave={(e) => {
        if (isProjectType(project.type, ProjectType.MASTER)) {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
      onDragStart={(e) => {
        if (isProjectType(project.type, ProjectType.MASTER)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onDragOver={(e) => {
        if (isProjectType(project.type, ProjectType.MASTER)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onDragEnter={(e) => {
        if (isProjectType(project.type, ProjectType.MASTER)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onDragLeave={(e) => {
        if (isProjectType(project.type, ProjectType.MASTER)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onDrop={(e) => {
        if (isProjectType(project.type, ProjectType.MASTER)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <div className="flex items-center gap-1 select-none">
        {/* Hierarchical 들여쓰기 - level에 따라 들여쓰기 */}
        {level > 0 && (
          <div style={{ width: `${level * 24}px` }} className="flex-shrink-0" />
        )}
        
        {/* Master/Sub 확장 컨트롤 - 공간 할당 */}
        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
          {/* Master 프로젝트는 폴더 아이콘으로 확장/축소 */}
          {(isProjectType(project.type, ProjectType.MASTER) && project.children && project.children.length > 0) && (
          <button
            onClick={(e) => {
              console.log('[SelectionCell] Master toggle button clicked');
              e.stopPropagation();
              e.preventDefault();
              handleMasterToggle(e);
            }}
            onMouseDown={(e) => {
              console.log('[SelectionCell] Master button mouseDown');
              e.stopPropagation();
              e.preventDefault();
            }}
            onMouseLeave={(e) => {
              console.log('[SelectionCell] Master button mouseLeave - folder button left');
              e.stopPropagation();
              e.preventDefault();
            }}
            onMouseUp={(e) => {
              console.log('[SelectionCell] Master button mouseUp');
              e.stopPropagation();
              e.preventDefault();
            }}
            onDragStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            style={{ userSelect: 'none' }}
            className="p-0.5 rounded transition-colors hover:bg-gray-200"
            title={project.isExpanded ? "폴더 접기" : "폴더 펼치기"}
          >
            {project.isExpanded ? (
              <FolderOpen className="w-4 h-4 text-blue-600" />
            ) : (
              <Folder className="w-4 h-4 text-blue-600" />
            )}
            </button>
          )}
          
          {/* SUB 프로젝트는 chevron으로 태스크 확장/축소 */}
          {isProjectType(project.type, ProjectType.SUB) && (
            <button
              onClick={handleToggleTasks}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onMouseUp={(e) => {
                e.stopPropagation();
              }}
              onMouseLeave={(e) => {
                e.stopPropagation();
              }}
              className="p-0.5 rounded transition-colors hover:bg-gray-200"
              title={isExpanded ? "태스크 숨기기" : "태스크 표시"}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          )}
        </div>
        
        {/* 체크박스 - 모든 타입에서 동일한 위치 */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(e.target.checked);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            if (isProjectType(project.type, ProjectType.MASTER)) {
              e.preventDefault();
            } else if (index !== undefined && onStartDrag) {
              onStartDrag(index);
            }
          }}
          onMouseEnter={(e) => {
            if (isDragging && e.buttons === 1 && !isProjectType(project.type, ProjectType.MASTER)) {
              e.stopPropagation();
            }
          }}
          className="w-4 h-4 rounded border border-gray-300 text-blue-600 focus:ring-1 focus:ring-blue-500 cursor-pointer transition-all hover:border-blue-400 flex-shrink-0"
          style={{ userSelect: 'none' }}
          aria-label={`${isProjectType(project.type, ProjectType.MASTER) ? '마스터 ' : ''}프로젝트 ${project.client} 선택`}
        />
      </div>
    </div>
  );
};

export default SelectionCell;