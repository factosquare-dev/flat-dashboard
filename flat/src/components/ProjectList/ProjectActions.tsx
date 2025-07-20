import React from 'react';
import { Plus, Mail, Search, Filter } from 'lucide-react';
import type { Priority, ServiceType, ProjectStatus } from '../../types/project';
import ProjectFilters from './ProjectFilters';

interface ProjectActionsProps {
  selectedPriority: Priority | 'all';
  selectedServiceType: ServiceType | 'all';
  statusFilters: ProjectStatus[];
  searchValue: string;
  totalProjects: number;
  filteredCount?: number;
  onPriorityChange: (priority: Priority | 'all') => void;
  onServiceTypeChange: (serviceType: ServiceType | 'all') => void;
  onStatusFilterToggle: (status: ProjectStatus) => void;
  onSearchChange: (value: string) => void;
  onCreateProject: () => void;
  onSendEmail: () => void;
}

const ProjectActions: React.FC<ProjectActionsProps> = ({
  selectedPriority,
  selectedServiceType,
  statusFilters,
  searchValue,
  totalProjects,
  filteredCount,
  onPriorityChange,
  onServiceTypeChange,
  onStatusFilterToggle,
  onSearchChange,
  onCreateProject,
  onSendEmail
}) => {
  return (
    <div className="w-full max-w-full">
      {/* 상단 헤더 영역 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200 rounded-lg shadow-sm mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">프로젝트 관리</h1>
            <p className="text-sm text-gray-600">전체 {totalProjects}개의 프로젝트</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onSendEmail}
              className="px-4 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
            >
              <Mail className="w-4 h-4" />
              메일 보내기
            </button>
            <button
              onClick={onCreateProject}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              새 프로젝트
            </button>
          </div>
        </div>
      </div>
      
      {/* 검색 및 필터 영역 */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4">
        <ProjectFilters
          selectedPriority={selectedPriority}
          selectedServiceType={selectedServiceType}
          statusFilters={statusFilters}
          searchValue={searchValue}
          onPriorityChange={onPriorityChange}
          onServiceTypeChange={onServiceTypeChange}
          onStatusFilterToggle={onStatusFilterToggle}
          onSearchChange={onSearchChange}
        />
      </div>
    </div>
  );
};

export default ProjectActions;