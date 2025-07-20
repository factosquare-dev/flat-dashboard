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
      {/* 검색 및 필터 영역 */}
      <div className="bg-white">
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