import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Project } from '@/shared/types/project';
import { getProductLabel } from '../utils/productTypeUtils';

interface ProjectNavigationProps {
  subProjects: Project[];
  currentProjects: Project[];
  selectedProjectIndex: number;
  currentPageIndex: number;
  totalPages: number;
  itemsPerPage: number;
  onSelectProject: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export const ProjectNavigation: React.FC<ProjectNavigationProps> = ({
  subProjects,
  currentProjects,
  selectedProjectIndex,
  currentPageIndex,
  totalPages,
  itemsPerPage,
  onSelectProject,
  onPrevious,
  onNext
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">프로젝트 상세</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevious}
            disabled={currentPageIndex === 0}
            className="p-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-600">
            {currentPageIndex + 1} / {totalPages}
          </span>
          <button
            onClick={onNext}
            disabled={currentPageIndex >= totalPages - 1}
            className="p-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {currentProjects.map((project, relativeIndex) => {
          const absoluteIndex = currentPageIndex * itemsPerPage + relativeIndex;
          const isSelected = absoluteIndex === selectedProjectIndex;

          return (
            <button
              key={project.id}
              onClick={() => onSelectProject(absoluteIndex)}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                isSelected
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {getProductLabel(project, subProjects)}
            </button>
          );
        })}
      </div>
    </div>
  );
};