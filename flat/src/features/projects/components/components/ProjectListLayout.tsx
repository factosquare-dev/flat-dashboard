import React from 'react';
import { Plus, Mail } from 'lucide-react';
import ProjectActions from '../ProjectActions';
import type { Priority, ServiceType, ProjectStatus } from '../../../types/project';

interface ProjectListLayoutProps {
  containerStyle: { top: string; left: string };
  onRefresh: () => void;
  onSendEmail: () => void;
  onSearch: (query: string) => void;
  onCreateProject: () => void;
  children: React.ReactNode;
  selectedPriority?: Priority | 'all';
  selectedServiceType?: ServiceType | 'all';
  statusFilters?: ProjectStatus[];
  searchValue?: string;
  dateRange?: { start: string | null; end: string | null };
  totalProjects?: number;
  onPriorityChange?: (priority: Priority | 'all') => void;
  onServiceTypeChange?: (serviceType: ServiceType | 'all') => void;
  onStatusFilterToggle?: (status: ProjectStatus) => void;
  onDateRangeChange?: (range: { start: string | null; end: string | null }) => void;
}

const ProjectListLayout: React.FC<ProjectListLayoutProps> = ({
  containerStyle,
  onRefresh,
  onSendEmail,
  onSearch,
  onCreateProject,
  children,
  selectedPriority,
  selectedServiceType,
  statusFilters,
  searchValue,
  dateRange,
  totalProjects,
  onPriorityChange,
  onServiceTypeChange,
  onStatusFilterToggle,
  onDateRangeChange
}) => {
  return (
    <div className="fixed inset-0 bg-gray-50 overflow-hidden">
      <div 
        className="absolute bg-white overflow-hidden"
        style={{
          top: containerStyle.top,
          left: containerStyle.left,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="flex-shrink-0 px-4 pt-2 pb-2 w-full border-b border-gray-100">
          <ProjectActions 
            selectedPriority={selectedPriority || 'all'}
            selectedServiceType={selectedServiceType || 'all'}
            statusFilters={statusFilters || []}
            searchValue={searchValue || ''}
            dateRange={dateRange || { start: null, end: null }}
            totalProjects={totalProjects || 0}
            onPriorityChange={onPriorityChange || (() => {})}
            onServiceTypeChange={onServiceTypeChange || (() => {})}
            onStatusFilterToggle={onStatusFilterToggle || (() => {})}
            onDateRangeChange={onDateRangeChange || (() => {})}
            onSearchChange={onSearch}
            onCreateProject={onCreateProject}
            onSendEmail={onSendEmail}
          />
        </div>

        <div className="flex-1 min-h-0 w-full overflow-hidden">
          {children}
        </div>
      </div>
      
      {/* Floating Mail Button */}
      <button
        onClick={onSendEmail}
        className="fixed bottom-24 right-8 bg-white text-gray-700 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center overflow-hidden border border-gray-200 z-50 group"
      >
        <div className="flex items-center gap-0 group-hover:gap-2 transition-all duration-300 px-4 py-4 group-hover:pr-5">
          <Mail className="w-5 h-5 flex-shrink-0" />
          <span className="max-w-0 group-hover:max-w-[80px] overflow-hidden whitespace-nowrap transition-all duration-300 font-medium text-sm">
            메일 보내기
          </span>
        </div>
      </button>
      
      {/* Floating Create Project Button */}
      <button
        onClick={onCreateProject}
        className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center overflow-hidden z-50 group"
      >
        <div className="flex items-center gap-0 group-hover:gap-2 transition-all duration-300 px-4 py-4 group-hover:pr-6">
          <Plus className="w-6 h-6 flex-shrink-0" />
          <span className="max-w-0 group-hover:max-w-[100px] overflow-hidden whitespace-nowrap transition-all duration-300 font-medium text-sm">
            새 프로젝트
          </span>
        </div>
      </button>
    </div>
  );
};

export default ProjectListLayout;