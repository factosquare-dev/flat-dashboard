import React from 'react';
import { Plus, Mail, Search, Filter } from 'lucide-react';
import type { Priority, ServiceType, ProjectStatus } from '../../types/project';
import ProjectFilters from './ProjectFilters';

interface ProjectActionsProps {
  selectedPriority: Priority | 'all';
  selectedServiceType: ServiceType | 'all';
  statusFilters: ProjectStatus[];
  searchValue: string;
  dateRange: { start: string | null; end: string | null };
  totalProjects: number;
  filteredCount?: number;
  onPriorityChange: (priority: Priority | 'all') => void;
  onServiceTypeChange: (serviceType: ServiceType | 'all') => void;
  onStatusFilterToggle: (status: ProjectStatus) => void;
  onSearchChange: (value: string) => void;
  onDateRangeChange: (range: { start: string | null; end: string | null }) => void;
  onCreateProject: () => void;
  onSendEmail: () => void;
}

const ProjectActions: React.FC<ProjectActionsProps> = ({
  selectedPriority,
  selectedServiceType,
  statusFilters,
  searchValue,
  dateRange,
  totalProjects,
  filteredCount,
  onPriorityChange,
  onServiceTypeChange,
  onStatusFilterToggle,
  onSearchChange,
  onDateRangeChange,
  onCreateProject,
  onSendEmail
}) => {
  return (
    <div className="w-full max-w-full">
      {/* 상단 헤더 영역 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border-b border-gray-200 rounded-lg shadow-sm mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">프로젝트 관리</h1>
            <span className="text-sm text-gray-600">전체 {totalProjects}개</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onSendEmail}
              className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow flex items-center gap-2 font-medium text-sm"
            >
              <Mail className="w-4 h-4" />
              메일 보내기
            </button>
          </div>
        </div>
      </div>
      
      {/* 검색 및 필터 영역 */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-3">
        <ProjectFilters
          selectedPriority={selectedPriority}
          selectedServiceType={selectedServiceType}
          statusFilters={statusFilters}
          searchValue={searchValue}
          dateRange={dateRange}
          onPriorityChange={onPriorityChange}
          onServiceTypeChange={onServiceTypeChange}
          onStatusFilterToggle={onStatusFilterToggle}
          onSearchChange={onSearchChange}
          onDateRangeChange={onDateRangeChange}
        />
      </div>
    </div>
  );
};

export default ProjectActions;