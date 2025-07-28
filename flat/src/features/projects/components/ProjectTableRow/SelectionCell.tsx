import React from 'react';
import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react';
import type { Project } from '@/types/project';
import { ProjectTypeEnum } from '@/types/enums';
import { isProjectType } from '@/utils/projectTypeUtils';

interface SelectionCellProps {
  project: Project;
  isExpanded: boolean;
  isSelected: boolean;
  isDragging?: boolean;
  index?: number;
  onSelect: (checked: boolean) => void;
  onStartDrag?: (index: number) => void;
  handleToggleTasks: (e: React.MouseEvent) => void;
}

const SelectionCell: React.FC<SelectionCellProps> = ({
  project,
  isExpanded,
  isSelected,
  isDragging,
  index,
  onSelect,
  onStartDrag,
  handleToggleTasks
}) => {
  return (
    <td className="px-1 py-1.5" onClick={(e) => e.stopPropagation()}>
      <div 
        className="flex items-center gap-1"
        style={{ paddingLeft: `${(project.level || 0) * 20}px` }}
      >
        {/* 대형 프로젝트만 확장/축소 버튼 */}
        {(isProjectType(project.type, ProjectTypeEnum.MASTER) && project.children && project.children.length > 0) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              // MASTER 프로젝트의 확장/축소는 onSelect을 통해 처리됨
              onSelect(!project.isExpanded);
            }}
            className="p-0.5 rounded transition-colors hover:bg-gray-200"
            title={project.isExpanded ? "축소" : "확장"}
          >
            {project.isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            )}
          </button>
        )}
        
        {/* 대형 프로젝트만 폴더 아이콘 */}
        {isProjectType(project.type, ProjectTypeEnum.MASTER) && (
          project.isExpanded ? 
            <FolderOpen className="w-4 h-4 text-blue-600" /> : 
            <Folder className="w-4 h-4 text-blue-600" />
        )}
        
        {/* 소형 프로젝트는 기존처럼 확장/축소 버튼과 체크박스 */}
        {isProjectType(project.type, ProjectTypeEnum.SUB) && (
          <>
            <button
              onClick={handleToggleTasks}
              className="p-0.5 rounded transition-colors hover:bg-gray-200"
              title={isExpanded ? "태스크 숨기기" : "태스크 표시"}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect(e.target.checked);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                if (index !== undefined && onStartDrag) {
                  onStartDrag(index);
                }
              }}
              onMouseEnter={(e) => {
                if (isDragging && e.buttons === 1) {
                  e.stopPropagation();
                }
              }}
              className="w-4 h-4 rounded border border-gray-300 text-blue-600 focus:ring-1 focus:ring-blue-500 cursor-pointer transition-all hover:border-blue-400"
              style={{ userSelect: 'none' }}
              aria-label={`프로젝트 ${project.client} 선택`}
            />
          </>
        )}
        
        {/* 태스크는 들여쓰기와 체크박스만 */}
        {isProjectType(project.type, ProjectTypeEnum.TASK) && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(e.target.checked);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              // 드래그 시작
              if (index !== undefined && onStartDrag) {
                onStartDrag(index);
              }
            }}
            onMouseEnter={(e) => {
              if (isDragging && e.buttons === 1) {
                e.stopPropagation();
                // 드래그 중에는 행의 onMouseEnter가 처리하므로 여기서는 아무것도 하지 않음
              }
            }}
            className="w-4 h-4 rounded border border-gray-300 text-blue-600 focus:ring-1 focus:ring-blue-500 cursor-pointer transition-all hover:border-blue-400"
            style={{ userSelect: 'none' }}
            aria-label={`프로젝트 ${project.client} 선택`}
          />
        )}
      </div>
    </td>
  );
};

export default SelectionCell;